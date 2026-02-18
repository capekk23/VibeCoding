const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all users (for selecting DM recipient)
router.get('/users', (req, res) => {
  db.all(
    'SELECT id, username FROM users ORDER BY username',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(rows);
    }
  );
});

// Get conversations for a user (list of users they've messaged)
router.get('/:user_id/conversations', (req, res) => {
  const userId = req.params.user_id;

  db.all(
    `SELECT DISTINCT 
       CASE WHEN from_user_id = ? THEN to_user_id ELSE from_user_id END as user_id,
       CASE WHEN from_user_id = ? THEN to_username ELSE from_username END as username
     FROM direct_messages
     WHERE from_user_id = ? OR to_user_id = ?
     ORDER BY created_at DESC`,
    [userId, userId, userId, userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch conversations' });
      }
      res.json(rows);
    }
  );
});

// Get DM conversation between two users
router.get('/:user_id/with/:other_user_id', (req, res) => {
  const { user_id, other_user_id } = req.params;

  db.all(
    `SELECT id, from_user_id, to_user_id, from_username, to_username, content, is_read, created_at
     FROM direct_messages
     WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
     ORDER BY created_at DESC LIMIT 50`,
    [user_id, other_user_id, other_user_id, user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
      
      // Mark messages as read
      db.run(
        `UPDATE direct_messages SET is_read = 1
         WHERE to_user_id = ? AND from_user_id = ? AND is_read = 0`,
        [user_id, other_user_id]
      );

      res.json(rows.reverse());
    }
  );
});

// Send DM
router.post('/', (req, res) => {
  const { from_user_id, to_user_id, from_username, to_username, content } = req.body;

  if (!from_user_id || !to_user_id || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO direct_messages (from_user_id, to_user_id, from_username, to_username, content)
     VALUES (?, ?, ?, ?, ?)`,
    [from_user_id, to_user_id, from_username, to_username, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }
      res.json({
        id: this.lastID,
        from_user_id,
        to_user_id,
        from_username,
        to_username,
        content,
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }
  );
});

module.exports = router;
