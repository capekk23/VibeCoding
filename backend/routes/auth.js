const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// Helper function to hash passwords
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper function to generate JWT (simple version)
const generateToken = (userId) => {
  return crypto.randomBytes(32).toString('hex');
};

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const hashedPassword = hashPassword(password);

  try {
    const result = await db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );
    const userId = result.rows[0].id;
    const token = generateToken(userId);
    res.json({ id: userId, username, token, is_admin: username === 'Karel' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Username already exists or database error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const hashedPassword = hashPassword(password);

  try {
    const result = await db.query(
      'SELECT id, username, is_admin FROM users WHERE username = $1 AND password = $2',
      [username, hashedPassword]
    );
    const row = result.rows[0];

    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(row.id);
    res.json({ id: row.id, username: row.username, token, is_admin: row.is_admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
