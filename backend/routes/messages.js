const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all messages
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, user_id, username, content, created_at FROM messages ORDER BY created_at DESC LIMIT 50'
    );
    res.json(result.rows.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/', async (req, res) => {
  const { user_id, username, content } = req.body;

  if (!user_id || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      'INSERT INTO messages (user_id, username, content) VALUES ($1, $2, $3) RETURNING id, created_at',
      [user_id, username, content]
    );
    res.json({
      id: result.rows[0].id,
      user_id,
      username,
      content,
      created_at: result.rows[0].created_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
