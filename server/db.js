import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL from .env or environment variables (Render)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        trainer_id INTEGER,
        profile_image TEXT,
        language TEXT DEFAULT 'en'
      )
    `);

    // Profiles Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE,
        age INTEGER,
        weight REAL,
        height REAL,
        gender TEXT,
        activity_level TEXT,
        goal TEXT,
        dietary_preferences TEXT,
        profile_data TEXT,
        CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Plans Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE,
        plan_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_plan FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Workout Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        date TEXT NOT NULL,
        exercise TEXT NOT NULL,
        sets INTEGER,
        reps INTEGER,
        weight REAL,
        CONSTRAINT fk_user_workout FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Nutrition Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS nutrition_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        date TEXT NOT NULL,
        calories INTEGER,
        protein INTEGER,
        carbs INTEGER,
        fat INTEGER,
        CONSTRAINT fk_user_nutrition FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Support Tickets
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        trainer_id INTEGER,
        message TEXT NOT NULL,
        reply TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        replied_at TIMESTAMP,
        sender_id INTEGER,
        CONSTRAINT fk_user_support FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_trainer_support FOREIGN KEY(trainer_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Bookings
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        trainer_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        start_time TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_trainer_booking FOREIGN KEY(trainer_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_client_booking FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add columns if they don't exist (equivalent to SQLite migrations)
    const addColumnIfNotExists = async (table, column, type) => {
      await client.query(`
        DO $$ 
        BEGIN 
          BEGIN
            ALTER TABLE ${table} ADD COLUMN ${column} ${type};
          EXCEPTION
            WHEN duplicate_column THEN NULL;
          END;
        END $$;
      `);
    };

    await addColumnIfNotExists('profiles', 'profile_data', 'TEXT');
    await addColumnIfNotExists('users', 'trainer_id', 'INTEGER');
    await addColumnIfNotExists('users', 'language', 'TEXT');
    await addColumnIfNotExists('support_tickets', 'sender_id', 'INTEGER');

    // Default admin
    const checkAdmin = await client.query("SELECT * FROM users WHERE username = 'admin'");
    if (checkAdmin.rowCount === 0) {
      const defaultPassword = bcrypt.hashSync('admin', 10);
      await client.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", ['admin', defaultPassword, 'admin']);
      console.log('Default admin created');
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', e);
    throw e;
  } finally {
    client.release();
  }
};

// Export a query helper that uses the pool
export const query = (text, params) => pool.query(text, params);

export default {
  query,
  pool,
  initDb
};
