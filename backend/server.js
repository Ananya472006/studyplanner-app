require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_study_quest_key_2026';

app.use(cors());
app.use(express.json());

// MySQL connection pool (initialized dynamically)
let pool = null;

async function initializeDatabase() {
  const configWithoutDb = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl: (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') ? {} : undefined
  };

  const dbName = process.env.DB_NAME || 'studyquest';

  try {
    // 1. Connect without database name first to create it if it doesn't exist
    const tempConnection = await mysql.createConnection(configWithoutDb);
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.end();

    // 2. Initialize pool with database name
    pool = mysql.createPool({
      ...configWithoutDb,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`Successfully connected to MySQL database: ${dbName}`);

    // 3. Create tables if they don't exist
    await createTables();
  } catch (err) {
    console.error('\n*******************************************************************************');
    console.error('WARNING: FAILED TO CONNECT TO MYSQL ON STARTUP.');
    console.error('Please ensure:');
    console.error('1. Your MySQL server is running (e.g. via XAMPP, Laragon, or as a service).');
    console.error('2. The credentials in backend/.env are correct.');
    console.error('\nError detail:', err.message);
    console.error('*******************************************************************************\n');
  }
}

async function createTables() {
  const connection = await pool.getConnection();
  try {
    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        xp INT DEFAULT 0,
        streak INT DEFAULT 0,
        daily_budget INT DEFAULT 3,
        compulsory_single TINYINT(1) DEFAULT 0,
        last_active_date VARCHAR(10) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subjects Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) NOT NULL,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        difficulty VARCHAR(20) NOT NULL,
        weekly_hours INT NOT NULL,
        preferred_days_count INT NOT NULL,
        PRIMARY KEY (id, user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // History Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date VARCHAR(10) NOT NULL,
        subject_id VARCHAR(50) NOT NULL,
        completed TINYINT(1) DEFAULT 1,
        hours_completed FLOAT NOT NULL,
        is_revision TINYINT(1) DEFAULT 0,
        timestamp BIGINT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables verified/created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    connection.release();
  }
}

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // { id, username }
    next();
  });
};

// Database availability check middleware
const checkDb = (req, res, next) => {
  if (!pool) {
    return res.status(503).json({ 
      error: 'Database connection is not available. Please ensure your MySQL service is running.' 
    });
  }
  next();
};

// --- AUTH ENDPOINTS ---

// Register Endpoint
app.post('/api/auth/register', checkDb, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, username }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed due to server error' });
  }
});

// Login Endpoint
app.post('/api/auth/login', checkDb, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
});


// --- DATA ENDPOINTS (AUTHENTICATED) ---

// Load user dashboard details
app.get('/api/load', checkDb, authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch user setting details
    const [userRows] = await pool.query(
      'SELECT xp, streak, daily_budget, compulsory_single, last_active_date FROM users WHERE id = ?', 
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    // 2. Fetch subjects
    const [subjects] = await pool.query(
      'SELECT id, name, difficulty, weekly_hours as weeklyHours, preferred_days_count as preferredDaysCount FROM subjects WHERE user_id = ?', 
      [userId]
    );

    // 3. Fetch history log
    const [history] = await pool.query(
      'SELECT date, subject_id as subjectId, completed, hours_completed as hoursCompleted, is_revision as isRevision, timestamp FROM history WHERE user_id = ?', 
      [userId]
    );

    // Convert SQL types to JS types
    const formattedHistory = history.map(h => ({
      ...h,
      completed: !!h.completed,
      isRevision: !!h.isRevision,
      timestamp: Number(h.timestamp)
    }));

    res.json({
      xp: user.xp,
      streak: user.streak,
      dailyBudget: user.daily_budget,
      compulsorySingleSubject: !!user.compulsory_single,
      lastActiveDate: user.last_active_date || '',
      subjects: subjects,
      history: formattedHistory
    });
  } catch (err) {
    console.error('Load error:', err);
    res.status(500).json({ error: 'Failed to load user data' });
  }
});

// Synchronize user dashboard details
app.post('/api/sync', checkDb, authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { xp, streak, dailyBudget, compulsorySingleSubject, lastActiveDate, subjects, history } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update user settings and gamification stats
    await connection.query(
      `UPDATE users 
       SET xp = ?, streak = ?, daily_budget = ?, compulsory_single = ?, last_active_date = ? 
       WHERE id = ?`,
      [xp || 0, streak || 0, dailyBudget || 3, compulsorySingleSubject ? 1 : 0, lastActiveDate || '', userId]
    );

    // 2. Sync subjects: delete existing and insert new ones
    await connection.query('DELETE FROM subjects WHERE user_id = ?', [userId]);
    if (subjects && subjects.length > 0) {
      const subjectValues = subjects.map(s => [
        s.id,
        userId,
        s.name,
        s.difficulty,
        s.weeklyHours,
        s.preferredDaysCount
      ]);
      await connection.query(
        'INSERT INTO subjects (id, user_id, name, difficulty, weekly_hours, preferred_days_count) VALUES ?',
        [subjectValues]
      );
    }

    // 3. Sync history: delete existing and insert new ones
    await connection.query('DELETE FROM history WHERE user_id = ?', [userId]);
    if (history && history.length > 0) {
      const historyValues = history.map(h => [
        userId,
        h.date,
        h.subjectId,
        h.completed ? 1 : 0,
        h.hoursCompleted,
        h.isRevision ? 1 : 0,
        h.timestamp
      ]);
      await connection.query(
        'INSERT INTO history (user_id, date, subject_id, completed, hours_completed, is_revision, timestamp) VALUES ?',
        [historyValues]
      );
    }

    await connection.commit();
    res.json({ message: 'Sync successful' });
  } catch (err) {
    await connection.rollback();
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Failed to synchronize study details' });
  } finally {
    connection.release();
  }
});


// Start server & init DB
app.listen(PORT, async () => {
  console.log(`StudyQuest Sync Server running on http://localhost:${PORT}`);
  await initializeDatabase();
});
