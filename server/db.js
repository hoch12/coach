import Database from 'better-sqlite3';

const db = new Database('database.sqlite', { verbose: console.log });

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    trainer_id INTEGER,
    FOREIGN KEY(trainer_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    age INTEGER,
    weight REAL,
    height REAL,
    gender TEXT,
    activity_level TEXT,
    goal TEXT,
    dietary_preferences TEXT,
    profile_data TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    plan_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS workout_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT NOT NULL,
    exercise TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight REAL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS nutrition_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT NOT NULL,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    trainer_id INTEGER,
    message TEXT NOT NULL,
    reply TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    replied_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(trainer_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainer_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

try {
  db.exec("ALTER TABLE profiles ADD COLUMN profile_data TEXT");
} catch (e) {
  // column already exists
}

try {
  db.exec("ALTER TABLE users ADD COLUMN trainer_id INTEGER");
} catch (e) {
  // column already exists
}

try {
  db.exec("ALTER TABLE support_tickets ADD COLUMN trainer_id INTEGER");
} catch (e) {
  // column already exists
}

// Add default admin if not exists
const checkAdmin = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
import bcrypt from 'bcryptjs';
if (!checkAdmin) {
  const defaultPassword = bcrypt.hashSync('admin', 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run('admin', defaultPassword, 'admin');
}

export default db;
