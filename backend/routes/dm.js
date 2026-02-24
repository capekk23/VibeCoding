const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all users (for selecting DM recipient)
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username FROM users ORDER BY username'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get conversations for a user (list of users they've messaged)
router.get('/:user_id/conversations', async (req, res) => {
  const userId = req.params.user_id;

  try {
    const result = await db.query(
      `SELECT user_id, username, MAX(created_at) as last_message
       FROM (
         SELECT 
           CASE WHEN from_user_id = $1 THEN to_user_id ELSE from_user_id END as user_id,
           CASE WHEN from_user_id = $2 THEN to_username ELSE from_username END as username,
           created_at
         FROM direct_messages
         WHERE from_user_id = $3 OR to_user_id = $4
       ) sub
       GROUP BY user_id, username
       ORDER BY last_message DESC`,
      [userId, userId, userId, userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get DM conversation between two users
router.get('/:user_id/with/:other_user_id', async (req, res) => {
  const { user_id, other_user_id } = req.params;

  try {
    const result = await db.query(
      `SELECT id, from_user_id, to_user_id, from_username, to_username, content, is_read, created_at
       FROM direct_messages
       WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $3 AND to_user_id = $4)
       ORDER BY created_at DESC LIMIT 50`,
      [user_id, other_user_id, other_user_id, user_id]
    );
    
    // Mark messages as read (non-blocking)
    db.query(
      `UPDATE direct_messages SET is_read = 1
       WHERE to_user_id = $1 AND from_user_id = $2 AND is_read = 0`,
      [user_id, other_user_id]
    ).catch(err => console.error('Error marking messages as read:', err));

    res.json(result.rows.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send DM
router.post('/', async (req, res) => {
  const { from_user_id, to_user_id, from_username, to_username, content } = req.body;

  if (!from_user_id || !to_user_id || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      `INSERT INTO direct_messages (from_user_id, to_user_id, from_username, to_username, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [from_user_id, to_user_id, from_username, to_username, content]
    );
    res.json({
      id: result.rows[0].id,
      from_user_id,
      to_user_id,
      from_username,
      to_username,
      content,
      is_read: 0,
      created_at: result.rows[0].created_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
