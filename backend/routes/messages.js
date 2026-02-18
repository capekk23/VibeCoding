const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all messages
router.get('/', (req, res) => {
  db.all(
    'SELECT id, user_id, username, content, created_at FROM messages ORDER BY created_at DESC LIMIT 50',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
      res.json(rows.reverse());
    }
  );
});

// Send message
router.post('/', (req, res) => {
  const { user_id, username, content } = req.body;

  if (!user_id || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO messages (user_id, username, content) VALUES (?, ?, ?)',
    [user_id, username, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }
      res.json({
        id: this.lastID,
        user_id,
        username,
        content,
        created_at: new Date().toISOString()
      });
    }
  );
});

module.exports = router;
