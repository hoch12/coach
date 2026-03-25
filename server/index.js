import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-coach-e-key';

app.use(cors());
app.use(express.json());

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
app.post('/api/auth/register', (req, res) => {
    const { username, password, role = 'user' } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        const info = stmt.run(username, hashedPassword, role);
        res.status(201).json({ id: info.lastInsertRowid, username, role });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || (error.message && error.message.includes('UNIQUE constraint'))) {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, trainer_id: user.trainer_id, profile_image: user.profile_image } });
});

app.post('/api/auth/change-password', authenticateToken, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!bcrypt.compareSync(oldPassword, user.password)) {
        return res.status(401).json({ error: 'Incorrect current password' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedNewPassword, req.user.id);
    res.json({ success: true });
});

app.put('/api/user/settings', authenticateToken, (req, res) => {
    const { username, profile_image } = req.body;

    try {
        if (username) {
            // Check if username taken by someone else
            const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
            if (existing) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id);
        }

        if (profile_image !== undefined) {
            db.prepare('UPDATE users SET profile_image = ? WHERE id = ?').run(profile_image, req.user.id);
        }

        const updatedUser = db.prepare('SELECT id, username, role, trainer_id, profile_image FROM users WHERE id = ?').get(req.user.id);
        res.json({ success: true, user: updatedUser });
    } catch (e) {
        console.error("Settings update error:", e);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// --- Profile Routes ---
app.get('/api/profile', authenticateToken, (req, res) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
    const profile = stmt.get(req.user.id);

    if (profile && profile.profile_data) {
        res.json(JSON.parse(profile.profile_data));
    } else if (profile) {
        res.json(profile);
    } else {
        res.json(null);
    }
});

app.post('/api/profile', authenticateToken, (req, res) => {
    try {
        const stmt = db.prepare(`
        INSERT INTO profiles (user_id, age, weight, height, gender, profile_data)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
          age=excluded.age, weight=excluded.weight, height=excluded.height, 
          gender=excluded.gender, profile_data=excluded.profile_data
      `);

        stmt.run(
            req.user.id,
            req.body.age || null,
            req.body.weight || null,
            req.body.height || null,
            req.body.gender || null,
            JSON.stringify(req.body)
        );
        res.json({ success: true });
    } catch (e) {
        console.error("Profile save error:", e);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// --- Plan Routes ---
app.get('/api/plan', authenticateToken, (req, res) => {
    const stmt = db.prepare('SELECT * FROM plans WHERE user_id = ?');
    const plan = stmt.get(req.user.id);
    res.json(plan || null);
});

app.post('/api/plan', authenticateToken, (req, res) => {
    const { plan_data } = req.body;
    const stmt = db.prepare(`
    INSERT INTO plans (user_id, plan_data) VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET plan_data=excluded.plan_data
  `);
    stmt.run(req.user.id, JSON.stringify(plan_data));
    res.json({ success: true });
});

// --- Admin Routes ---
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    const stmt = db.prepare('SELECT id, username, role, trainer_id, profile_image FROM users');
    const users = stmt.all();
    res.json(users);
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
});

app.post('/api/admin/create-trainer', authenticateToken, isAdmin, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const stmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'trainer')");
        const info = stmt.run(username, hashedPassword);
        res.status(201).json({ id: info.lastInsertRowid, username, role: 'trainer' });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

app.get('/api/admin/users/:id/profile', authenticateToken, isTrainer, (req, res) => {
    const userStmt = db.prepare('SELECT trainer_id FROM users WHERE id = ?');
    const u = userStmt.get(req.params.id);

    // Authorization check: Admin can see anyone, Trainer can only see their own clients
    if (req.user.role !== 'admin' && u?.trainer_id !== req.user.id) {
        return res.sendStatus(403);
    }

    const stmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
    const profile = stmt.get(req.params.id);

    if (profile && profile.profile_data) {
        res.json(JSON.parse(profile.profile_data));
    } else if (profile) {
        res.json(profile);
    } else {
        res.json(null);
    }
});

app.get('/api/admin/users/:id/plan', authenticateToken, isTrainer, (req, res) => {
    const userStmt = db.prepare('SELECT trainer_id FROM users WHERE id = ?');
    const u = userStmt.get(req.params.id);

    // Authorization check
    if (req.user.role !== 'admin' && u?.trainer_id !== req.user.id) {
        return res.sendStatus(403);
    }

    const stmt = db.prepare('SELECT * FROM plans WHERE user_id = ?');
    const plan = stmt.get(req.params.id);
    res.json(plan || null);
});

// --- Admin/Trainer/Client Management ---
app.get('/api/admin/trainers', authenticateToken, isAdmin, (req, res) => {
    const stmt = db.prepare("SELECT id, username FROM users WHERE role = 'trainer'");
    res.json(stmt.all());
});

app.post('/api/admin/assign-trainer', authenticateToken, isAdmin, (req, res) => {
    const { userId, trainerId } = req.body;
    const stmt = db.prepare('UPDATE users SET trainer_id = ? WHERE id = ?');
    stmt.run(trainerId, userId);
    res.json({ success: true });
});

app.get('/api/trainer/clients', authenticateToken, isTrainer, (req, res) => {
    const stmt = db.prepare('SELECT id, username, profile_image FROM users WHERE trainer_id = ?');
    res.json(stmt.all(req.user.id));
});

// --- Support / Chat Routes ---
app.get('/api/support', authenticateToken, (req, res) => {
    if (req.user.role === 'trainer') {
        const stmt = db.prepare(`
            SELECT s.*, u.username 
            FROM support_tickets s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.trainer_id = ? 
            ORDER BY s.created_at DESC
        `);
        return res.json(stmt.all(req.user.id));
    }

    // Client view
    const stmt = db.prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC');
    res.json(stmt.all(req.user.id));
});

app.get('/api/admin/support', authenticateToken, isAdmin, (req, res) => {
    const stmt = db.prepare(`
        SELECT s.*, u.username 
        FROM support_tickets s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.trainer_id IS NULL 
        ORDER BY s.created_at DESC
    `);
    res.json(stmt.all());
});

app.post('/api/support', authenticateToken, (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const { toAdmin } = req.body;
    const user = db.prepare('SELECT trainer_id FROM users WHERE id = ?').get(req.user.id);

    // Determine the actual trainer_id for the ticket
    const trainerId = (toAdmin === true || !user?.trainer_id) ? null : user.trainer_id;

    const stmt = db.prepare('INSERT INTO support_tickets (user_id, trainer_id, message) VALUES (?, ?, ?)');
    const info = stmt.run(req.user.id, trainerId, message);
    res.json({ success: true, id: info.lastInsertRowid });
});

app.post('/api/support/:id/reply', authenticateToken, (req, res) => {
    const { reply } = req.body;
    // Check if user is admin OR the trainer assigned to this ticket
    const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.trainer_id !== req.user.id) {
        return res.sendStatus(403);
    }

    const stmt = db.prepare(`
        UPDATE support_tickets 
        SET reply = ?, status = 'closed', replied_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `);
    stmt.run(reply, req.params.id);
    res.json({ success: true });
});

app.post('/api/admin/support/:id/reply', authenticateToken, isAdmin, (req, res) => {
    const { reply } = req.body;
    const stmt = db.prepare(`
        UPDATE support_tickets 
        SET reply = ?, status = 'closed', replied_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND trainer_id IS NULL
    `);
    stmt.run(reply, req.params.id);
    res.json({ success: true });
});

// --- Booking Routes ---
app.get('/api/bookings', authenticateToken, (req, res) => {
    let stmt;
    if (req.user.role === 'trainer') {
        stmt = db.prepare(`
            SELECT b.*, u.username as client_name 
            FROM bookings b 
            JOIN users u ON b.client_id = u.id 
            WHERE b.trainer_id = ? 
            ORDER BY b.start_time ASC
        `);
        res.json(stmt.all(req.user.id));
    } else {
        stmt = db.prepare(`
            SELECT b.*, u.username as trainer_name 
            FROM bookings b 
            JOIN users u ON b.trainer_id = u.id 
            WHERE b.client_id = ? 
            ORDER BY b.start_time ASC
        `);
        res.json(stmt.all(req.user.id));
    }
});

app.get('/api/bookings/trainer/:id', authenticateToken, (req, res) => {
    const stmt = db.prepare("SELECT start_time, duration_minutes FROM bookings WHERE trainer_id = ? AND status NOT IN ('cancelled', 'declined')");
    res.json(stmt.all(req.params.id));
});

app.post('/api/bookings', authenticateToken, (req, res) => {
    const { trainerId, startTime, durationMinutes = 60, clientId } = req.body;

    const finalClientId = req.user.role === 'trainer' ? (clientId || req.user.id) : req.user.id;

    // Basic double-booking check (very simple for now)
    const existing = db.prepare(`
        SELECT * FROM bookings 
        WHERE trainer_id = ? 
        AND status NOT IN ('cancelled', 'declined')
        AND (
            (start_time <= ? AND datetime(start_time, '+' || duration_minutes || ' minutes') > ?)
        )
    `).get(trainerId, startTime, startTime);

    if (existing) {
        return res.status(400).json({ error: 'Trainer is already booked at this time' });
    }

    const status = req.user.role === 'trainer' ? 'scheduled' : 'pending';
    const stmt = db.prepare('INSERT INTO bookings (trainer_id, client_id, start_time, duration_minutes, status) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(trainerId, finalClientId, startTime, durationMinutes, status);
    res.json({ success: true, id: info.lastInsertRowid, status });
});

app.post('/api/bookings/:id/accept', authenticateToken, isTrainer, (req, res) => {
    const stmt = db.prepare("UPDATE bookings SET status = 'scheduled' WHERE id = ? AND trainer_id = ?");
    const info = stmt.run(req.params.id, req.user.id);
    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
});

app.post('/api/bookings/:id/decline', authenticateToken, isTrainer, (req, res) => {
    const stmt = db.prepare("UPDATE bookings SET status = 'declined' WHERE id = ? AND trainer_id = ?"); // Use declined instead of cancelled so client knows why
    const info = stmt.run(req.params.id, req.user.id);
    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
});

app.post('/api/bookings/:id/cancel', authenticateToken, (req, res) => {
    const stmt = db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ? AND (client_id = ? OR trainer_id = ?)");
    const info = stmt.run(req.params.id, req.user.id, req.user.id);
    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
});

// --- Tracking Logs Routes ---
app.get('/api/logs/workout', authenticateToken, (req, res) => {
    const { date } = req.query;
    let stmt;
    if (date) {
        stmt = db.prepare('SELECT * FROM workout_logs WHERE user_id = ? AND date = ? ORDER BY id DESC');
        res.json(stmt.all(req.user.id, date));
    } else {
        stmt = db.prepare('SELECT * FROM workout_logs WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 50');
        res.json(stmt.all(req.user.id));
    }
});

app.post('/api/logs/workout', authenticateToken, (req, res) => {
    const { date, exercise, sets, reps, weight } = req.body;
    const stmt = db.prepare('INSERT INTO workout_logs (user_id, date, exercise, sets, reps, weight) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(req.user.id, date, exercise, sets, reps, weight);
    res.json({ success: true, id: info.lastInsertRowid });
});

app.get('/api/logs/nutrition', authenticateToken, (req, res) => {
    const { date } = req.query;
    let stmt;
    if (date) {
        stmt = db.prepare('SELECT * FROM nutrition_logs WHERE user_id = ? AND date = ?');
        res.json(stmt.get(req.user.id, date) || null);
    } else {
        stmt = db.prepare('SELECT * FROM nutrition_logs WHERE user_id = ? ORDER BY date DESC LIMIT 30');
        res.json(stmt.all(req.user.id));
    }
});

app.post('/api/logs/nutrition', authenticateToken, (req, res) => {
    const { date, calories, protein, carbs, fat } = req.body;
    // We only want ONE nutrition log per day per user. Delete old if exists.
    db.prepare('DELETE FROM nutrition_logs WHERE user_id = ? AND date = ?').run(req.user.id, date);

    const stmt = db.prepare('INSERT INTO nutrition_logs (user_id, date, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(req.user.id, date, calories, protein || 0, carbs || 0, fat || 0);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
