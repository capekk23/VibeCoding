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
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const hashedPassword = hashPassword(password);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      const token = generateToken(this.lastID);
      res.json({ id: this.lastID, username, token });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const hashedPassword = hashPassword(password);

  db.get(
    'SELECT id, username FROM users WHERE username = ? AND password = ?',
    [username, hashedPassword],
    (err, row) => {
      if (err || !row) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = generateToken(row.id);
      res.json({ id: row.id, username: row.username, token });
    }
  );
});

module.exports = router;
