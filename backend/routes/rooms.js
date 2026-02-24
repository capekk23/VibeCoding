const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, creator_id FROM rooms ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create room
router.post('/', async (req, res) => {
  const { name, creator_id } = req.body;

  if (!name || !creator_id) {
    return res.status(400).json({ error: 'Name and creator_id required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO rooms (name, creator_id) VALUES ($1, $2) RETURNING id',
      [name, creator_id]
    );
    const roomId = result.rows[0].id;

    // Auto-add creator to room
    await db.query(
      'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [roomId, creator_id]
    );

    res.json({ id: roomId, name, creator_id });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Room already exists or database error' });
  }
});

// Join room
router.post('/:id/join', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  try {
    await db.query(
      'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room members
router.get('/:id/members', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username FROM users u
       INNER JOIN room_members rm ON u.id = rm.user_id
       WHERE rm.room_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get room messages
router.get('/:id/messages', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id, username, content, created_at FROM room_messages
       WHERE room_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(result.rows.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post message to room
router.post('/:id/messages', async (req, res) => {
  const { user_id, username, content } = req.body;

  if (!user_id || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      'INSERT INTO room_messages (room_id, user_id, username, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      [req.params.id, user_id, username, content]
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
