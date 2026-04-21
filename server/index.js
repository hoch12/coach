import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'COACH_E_STABLE_DEV_SECRET_2024_!@#$%';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
};

const isTrainer = (req, res, next) => {
    if (req.user.role !== 'trainer' && req.user.role !== 'admin') return res.sendStatus(403);
    next();
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await db.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id', [username, hashedPassword, role]);
        res.status(201).json({ id: result.rows[0].id, username, role });
    } catch (error) {
        if (error.code === '23505') { // Postgres UNIQUE constraint error code
            res.status(400).json({ error: 'Username already exists' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, trainer_id: user.trainer_id, profile_image: user.profile_image, language: user.language } });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (user) {
        delete user.password;
        res.json({ user });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if (!bcrypt.compareSync(oldPassword, user.password)) {
        return res.status(401).json({ error: 'Incorrect current password' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, req.user.id]);
    res.json({ success: true });
});

app.put('/api/user/settings', authenticateToken, async (req, res) => {
    const { username, profile_image, language } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No user ID found in token' });
    }

    try {
        if (username) {
            // Check if username taken by someone else
            const existing = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, req.user.id]);
            if (existing.rowCount > 0) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            await db.query('UPDATE users SET username = $1 WHERE id = $2', [username, req.user.id]);
        }

        if (profile_image !== undefined) {
            await db.query('UPDATE users SET profile_image = $1 WHERE id = $2', [profile_image, req.user.id]);
        }

        if (language !== undefined) {
            await db.query('UPDATE users SET language = $1 WHERE id = $2', [language, req.user.id]);
        }

        const updatedResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        const updatedUser = updatedResult.rows[0];
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found during update' });
        }

        delete updatedUser.password;
        res.json({ success: true, user: updatedUser });
    } catch (e) {
        console.error("[Settings] Update error for user", req.user.id, ":", e.message);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// --- Profile Routes ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    const profile = result.rows[0];

    if (profile && profile.profile_data) {
        res.json(JSON.parse(profile.profile_data));
    } else if (profile) {
        res.json(profile);
    } else {
        res.json(null);
    }
});

app.post('/api/profile', authenticateToken, async (req, res) => {
    try {
        let targetUserId = req.user.id;

        if (req.body.userId) {
            // Check if requester is authorized
            if (req.user.role === 'admin') {
                targetUserId = req.body.userId;
            } else if (req.user.role === 'trainer') {
                const checkClientResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [req.body.userId]);
                const checkClient = checkClientResult.rows[0];
                if (checkClient && checkClient.trainer_id === req.user.id) {
                    targetUserId = req.body.userId;
                } else {
                    return res.status(403).json({ error: 'Not authorized to edit this client' });
                }
            } else {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

        await db.query(`
        INSERT INTO profiles (user_id, age, weight, height, gender, profile_data)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT(user_id) DO UPDATE SET 
          age=EXCLUDED.age, weight=EXCLUDED.weight, height=EXCLUDED.height, 
          gender=EXCLUDED.gender, profile_data=EXCLUDED.profile_data
      `, [
            targetUserId,
            req.body.age || null,
            req.body.weight || null,
            req.body.height || null,
            req.body.gender || null,
            JSON.stringify(req.body)
        ]);
        res.json({ success: true });
    } catch (e) {
        console.error("Profile save error:", e);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// --- Plan Routes ---
app.get('/api/plan', authenticateToken, async (req, res) => {
    const result = await db.query('SELECT * FROM plans WHERE user_id = $1', [req.user.id]);
    const plan = result.rows[0];
    res.json(plan || null);
});

app.post('/api/plan', authenticateToken, async (req, res) => {
    const { plan_data, userId } = req.body;
    let targetUserId = req.user.id;

    if (userId) {
        if (req.user.role === 'admin') {
            targetUserId = userId;
        } else if (req.user.role === 'trainer') {
            const checkClientResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [userId]);
            const checkClient = checkClientResult.rows[0];
            if (checkClient && checkClient.trainer_id === req.user.id) {
                targetUserId = userId;
            } else {
                return res.status(403).json({ error: 'Not authorized to edit this client' });
            }
        } else {
            return res.status(403).json({ error: 'Not authorized' });
        }
    }

    await db.query(`
    INSERT INTO plans (user_id, plan_data) VALUES ($1, $2)
    ON CONFLICT(user_id) DO UPDATE SET plan_data=EXCLUDED.plan_data
  `, [targetUserId, JSON.stringify(plan_data)]);
    res.json({ success: true });
});

// --- Admin Routes ---
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    const result = await db.query('SELECT * FROM users');
    const users = result.rows.map(u => { delete u.password; return u; });
    res.json(users);
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

app.post('/api/admin/create-trainer', authenticateToken, isAdmin, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await db.query("INSERT INTO users (username, password, role) VALUES ($1, $2, 'trainer') RETURNING id", [username, hashedPassword]);
        res.status(201).json({ id: result.rows[0].id, username, role: 'trainer' });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

app.get('/api/admin/users/:id/profile', authenticateToken, isTrainer, async (req, res) => {
    const userResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [req.params.id]);
    const u = userResult.rows[0];

    // Authorization check: Admin can see anyone, Trainer can only see their own clients
    if (req.user.role !== 'admin' && u?.trainer_id !== req.user.id) {
        return res.sendStatus(403);
    }

    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.params.id]);
    const profile = result.rows[0];

    if (profile && profile.profile_data) {
        res.json(JSON.parse(profile.profile_data));
    } else if (profile) {
        res.json(profile);
    } else {
        res.json(null);
    }
});

app.get('/api/admin/users/:id/plan', authenticateToken, isTrainer, async (req, res) => {
    const userResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [req.params.id]);
    const u = userResult.rows[0];

    // Authorization check
    if (req.user.role !== 'admin' && u?.trainer_id !== req.user.id) {
        return res.sendStatus(403);
    }

    const result = await db.query('SELECT * FROM plans WHERE user_id = $1', [req.params.id]);
    const plan = result.rows[0];
    res.json(plan || null);
});

// --- Admin/Trainer/Client Management ---
app.get('/api/admin/trainers', authenticateToken, isAdmin, async (req, res) => {
    const result = await db.query("SELECT * FROM users WHERE role = 'trainer'");
    const trainers = result.rows.map(u => { delete u.password; return u; });
    res.json(trainers);
});

app.post('/api/admin/assign-trainer', authenticateToken, isAdmin, async (req, res) => {
    const { userId, trainerId } = req.body;
    await db.query('UPDATE users SET trainer_id = $1 WHERE id = $2', [trainerId, userId]);
    res.json({ success: true });
});

app.get('/api/trainer/clients', authenticateToken, isTrainer, async (req, res) => {
    const result = await db.query('SELECT id, username, profile_image FROM users WHERE trainer_id = $1', [req.user.id]);
    res.json(result.rows);
});

// --- Support / Chat Routes ---
app.get('/api/support', authenticateToken, async (req, res) => {
    let query, params;
    if (req.user.role === 'admin') {
        return res.redirect('/api/admin/support');
    }

    if (req.user.role === 'trainer') {
        query = `
            SELECT s.id, s.user_id, s.trainer_id, s.message, s.status, s.created_at, s.sender_id,
                   u.username 
            FROM support_tickets s 
            LEFT JOIN users u ON s.user_id = u.id 
            WHERE s.user_id = $1 OR s.trainer_id = $2
            ORDER BY s.created_at ASC
        `;
        params = [req.user.id, req.user.id];
    } else {
        query = `
            SELECT s.*, u.username FROM support_tickets s 
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.user_id = $1 
            ORDER BY s.created_at ASC
        `;
        params = [req.user.id];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
});

app.get('/api/admin/support', authenticateToken, isAdmin, async (req, res) => {
    const result = await db.query(`
        SELECT 
            s.id, s.user_id, s.trainer_id, s.message, s.status, s.created_at, s.sender_id,
            u.username, u.role as user_role
        FROM support_tickets s 
        LEFT JOIN users u ON s.user_id = u.id 
        WHERE s.trainer_id IS NULL OR s.trainer_id = 0
        ORDER BY s.created_at ASC
    `);
    res.json(result.rows);
});

app.post('/api/support', authenticateToken, async (req, res) => {
    const { message, target } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    let trainerId = null;
    if (target !== 'admin') {
        const userResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];
        trainerId = user?.trainer_id || null;
    }

    const result = await db.query('INSERT INTO support_tickets (user_id, trainer_id, message, sender_id) VALUES ($1, $2, $3, $4) RETURNING id', [req.user.id, trainerId, message, req.user.id]);

    res.json({
        success: true,
        id: result.rows[0].id,
        recipient: trainerId ? 'trainer' : 'admin'
    });
});

app.post('/api/support/trainer-initiate', authenticateToken, isTrainer, async (req, res) => {
    const { clientId, message } = req.body;
    if (!clientId || !message) return res.status(400).json({ error: 'Client ID and message required' });

    const clientResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [clientId]);
    const client = clientResult.rows[0];
    
    if (!client || client.trainer_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to message this client' });
    }

    const result = await db.query(`
        INSERT INTO support_tickets (user_id, trainer_id, message, sender_id, status) 
        VALUES ($1, $2, $3, $4, 'open')
        RETURNING id
    `, [clientId, req.user.id, message, req.user.id]);

    res.json({ success: true, id: result.rows[0].id });
});

app.post('/api/support/:id/reply', authenticateToken, async (req, res) => {
    const { reply } = req.body;
    const ticketId = req.params.id;

    if (!reply) return res.status(400).json({ error: 'Reply is required' });

    const ticketResult = await db.query('SELECT * FROM support_tickets WHERE id = $1', [ticketId]);
    const ticket = ticketResult.rows[0];

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Multi-message logic: Insert a NEW record instead of updating the old one
    const result = await db.query(`
        INSERT INTO support_tickets (user_id, trainer_id, message, sender_id, status)
        VALUES ($1, $2, $3, $4, 'open')
        RETURNING id
    `, [ticket.user_id, ticket.trainer_id, reply, req.user.id]);

    res.json({ success: true, id: result.rows[0].id });
});

// Admin can initiate a conversation with any user (trainer or client)
// IMPORTANT: This must be defined BEFORE /:id/reply to avoid Express matching "initiate" as :id
app.post('/api/admin/support-initiate', authenticateToken, isAdmin, async (req, res) => {
    const { targetUserId, message } = req.body;
    if (!targetUserId || !message) return res.status(400).json({ error: 'targetUserId and message are required' });

    try {
        const userResult = await db.query('SELECT id, role FROM users WHERE id = $1', [targetUserId]);
        if (userResult.rowCount === 0) return res.status(404).json({ error: 'Target user not found' });

        const targetUser = userResult.rows[0];
        // trainer_id stays null — admin is the sender, conversation is tracked via user_id = targetUser.id
        const result = await db.query(`
            INSERT INTO support_tickets (user_id, trainer_id, message, sender_id, status)
            VALUES ($1, $2, $3, $4, 'open')
            RETURNING id
        `, [targetUser.id, null, message, req.user.id]);

        res.json({ success: true, id: result.rows[0].id });
    } catch (e) {
        console.error('[Admin initiate chat] Error:', e.message);
        res.status(500).json({ error: 'Failed to initiate conversation' });
    }
});

app.post('/api/admin/support/:id/reply', authenticateToken, isAdmin, async (req, res) => {
    const { reply } = req.body;
    const ticketId = req.params.id;

    if (!reply) return res.status(400).json({ error: 'Reply is required' });

    const ticketResult = await db.query('SELECT * FROM support_tickets WHERE id = $1', [ticketId]);
    const ticket = ticketResult.rows[0];

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const result = await db.query(`
        INSERT INTO support_tickets (user_id, trainer_id, message, sender_id, status)
        VALUES ($1, $2, $3, $4, 'open')
        RETURNING id
    `, [ticket.user_id, ticket.trainer_id, reply, req.user.id]);
    
    res.json({ success: true, id: result.rows[0].id });
});


app.get('/api/bookings', authenticateToken, async (req, res) => {
    let result;
    if (req.user.role === 'trainer') {
        result = await db.query(`
            SELECT b.*, u.username as client_name 
            FROM bookings b 
            JOIN users u ON b.client_id = u.id 
            WHERE b.trainer_id = $1 
            ORDER BY b.start_time ASC
        `, [req.user.id]);
        res.json(result.rows);
    } else {
        result = await db.query(`
            SELECT b.*, u.username as trainer_name 
            FROM bookings b 
            JOIN users u ON b.trainer_id = u.id 
            WHERE b.client_id = $1 
            ORDER BY b.start_time ASC
        `, [req.user.id]);
        res.json(result.rows);
    }
});

app.get('/api/bookings/trainer/:id', authenticateToken, async (req, res) => {
    const result = await db.query("SELECT start_time, duration_minutes FROM bookings WHERE trainer_id = $1 AND status NOT IN ('cancelled', 'declined')", [req.params.id]);
    res.json(result.rows);
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    const { trainerId, startTime, durationMinutes = 60, clientId } = req.body;

    const finalClientId = req.user.role === 'trainer' ? (clientId || req.user.id) : req.user.id;

    // Basic double-booking check (very simple for now)
    const existingResult = await db.query(`
        SELECT * FROM bookings 
        WHERE trainer_id = $1 
        AND status NOT IN ('cancelled', 'declined')
        AND (
            (start_time <= $2 AND (start_time + (duration_minutes || ' minutes')::interval) > $3)
        )
    `, [trainerId, startTime, startTime]);
    const existing = existingResult.rows[0];

    if (existing) {
        return res.status(400).json({ error: 'Trainer is already booked at this time' });
    }

    const status = req.user.role === 'trainer' ? 'scheduled' : 'pending';
    const result = await db.query('INSERT INTO bookings (trainer_id, client_id, start_time, duration_minutes, status) VALUES ($1, $2, $3, $4, $5) RETURNING id', [trainerId, finalClientId, startTime, durationMinutes, status]);
    res.json({ success: true, id: result.rows[0].id, status });
});

app.post('/api/bookings/:id/accept', authenticateToken, isTrainer, async (req, res) => {
    const result = await db.query("UPDATE bookings SET status = 'scheduled' WHERE id = $1 AND trainer_id = $2", [req.params.id, req.user.id]);
    if (result.rowCount > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
});

app.post('/api/bookings/:id/decline', authenticateToken, isTrainer, async (req, res) => {
    const result = await db.query("UPDATE bookings SET status = 'declined' WHERE id = $1 AND trainer_id = $2", [req.params.id, req.user.id]);
    if (result.rowCount > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
});

app.post('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
    const result = await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND (client_id = $2 OR trainer_id = $3)", [req.params.id, req.user.id, req.user.id]);
    if (result.rowCount > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
});

// --- Tracking Logs Routes ---
app.get('/api/logs/workout', authenticateToken, async (req, res) => {
    const { date } = req.query;
    let result;
    if (date) {
        result = await db.query('SELECT * FROM workout_logs WHERE user_id = $1 AND date = $2 ORDER BY id DESC', [req.user.id, date]);
    } else {
        result = await db.query('SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY date DESC, id DESC LIMIT 50', [req.user.id]);
    }
    res.json(result.rows);
});

app.post('/api/logs/workout', authenticateToken, async (req, res) => {
    const { date, exercise, sets, reps, weight } = req.body;
    const result = await db.query('INSERT INTO workout_logs (user_id, date, exercise, sets, reps, weight) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [req.user.id, date, exercise, sets, reps, weight]);
    res.json({ success: true, id: result.rows[0].id });
});

// --- Trainer-Client Progress Access ---
app.get('/api/trainer/client/:id/logs/workout', authenticateToken, isTrainer, async (req, res) => {
    const clientId = req.params.id;
    // Check if client belongs to trainer
    const clientResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [clientId]);
    const client = clientResult.rows[0];
    if (!client || client.trainer_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized access to client data' });
    }

    const result = await db.query('SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY date DESC, id DESC LIMIT 50', [clientId]);
    res.json(result.rows);
});

app.get('/api/trainer/client/:id/logs/nutrition', authenticateToken, isTrainer, async (req, res) => {
    const clientId = req.params.id;
    // Check if client belongs to trainer
    const clientResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [clientId]);
    const client = clientResult.rows[0];
    if (!client || client.trainer_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized access to client data' });
    }

    const result = await db.query('SELECT * FROM nutrition_logs WHERE user_id = $1 ORDER BY date DESC, id DESC LIMIT 50', [clientId]);
    res.json(result.rows);
});

app.get('/api/trainer/client/:id/logs/daily', authenticateToken, isTrainer, async (req, res) => {
    const clientId = req.params.id;
    // Check if client belongs to trainer
    const clientResult = await db.query('SELECT trainer_id FROM users WHERE id = $1', [clientId]);
    const client = clientResult.rows[0];
    if (!client || client.trainer_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized access to client data' });
    }

    const result = await db.query('SELECT * FROM daily_tracking WHERE user_id = $1 ORDER BY date DESC LIMIT 30', [clientId]);
    res.json(result.rows);
});

app.get('/api/logs/nutrition', authenticateToken, async (req, res) => {
    const { date } = req.query;
    let result;
    if (date) {
        result = await db.query('SELECT * FROM nutrition_logs WHERE user_id = $1 AND date = $2', [req.user.id, date]);
        res.json(result.rows[0] || null);
    } else {
        result = await db.query('SELECT * FROM nutrition_logs WHERE user_id = $1 ORDER BY date DESC LIMIT 30', [req.user.id]);
        res.json(result.rows);
    }
});

app.post('/api/logs/nutrition', authenticateToken, async (req, res) => {
    const { date, calories, protein, carbs, fat } = req.body;
    // We only want ONE nutrition log per day per user. Delete old if exists.
    await db.query('DELETE FROM nutrition_logs WHERE user_id = $1 AND date = $2', [req.user.id, date]);

    await db.query('INSERT INTO nutrition_logs (user_id, date, calories, protein, carbs, fat) VALUES ($1, $2, $3, $4, $5, $6)', [req.user.id, date, calories, protein || 0, carbs || 0, fat || 0]);
    res.json({ success: true });
});


const startServer = async (retries = 5, delay = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`[DB] Initialization attempt ${attempt}/${retries}...`);
            await db.initDb();
            console.log('[DB] Initialization successful.');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
            return;
        } catch (err) {
            console.error(`[DB] Attempt ${attempt} failed:`, err.message);
            if (attempt < retries) {
                console.log(`[DB] Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('[DB] All initialization attempts failed. Starting server anyway (DB may be unavailable).');
                app.listen(PORT, () => {
                    console.log(`Server running on port ${PORT} (DB connection failed - some endpoints may not work)`);
                });
            }
        }
    }
};

startServer();
