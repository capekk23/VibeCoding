const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all rooms
router.get('/', (req, res) => {
  db.all(
    'SELECT id, name, creator_id FROM rooms ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch rooms' });
      }
      res.json(rows);
    }
  );
});

// Create room
router.post('/', (req, res) => {
  const { name, creator_id } = req.body;

  if (!name || !creator_id) {
    return res.status(400).json({ error: 'Name and creator_id required' });
  }

  db.run(
    'INSERT INTO rooms (name, creator_id) VALUES (?, ?)',
    [name, creator_id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Room already exists' });
      }
      // Auto-add creator to room
      db.run(
        'INSERT INTO room_members (room_id, user_id) VALUES (?, ?)',
        [this.lastID, creator_id]
      );
      res.json({ id: this.lastID, name, creator_id });
    }
  );
});

// Join room
router.post('/:id/join', (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  db.run(
    'INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)',
    [req.params.id, user_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to join room' });
      }
      res.json({ success: true });
    }
  );
});

// Get room members
router.get('/:id/members', (req, res) => {
  db.all(
    `SELECT u.id, u.username FROM users u
     INNER JOIN room_members rm ON u.id = rm.user_id
     WHERE rm.room_id = ?`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch members' });
      }
      res.json(rows);
    }
  );
});

// Get room messages
router.get('/:id/messages', (req, res) => {
  db.all(
    `SELECT id, user_id, username, content, created_at FROM room_messages
     WHERE room_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
      res.json(rows.reverse());
    }
  );
});

// Post message to room
router.post('/:id/messages', (req, res) => {
  const { user_id, username, content } = req.body;

  if (!user_id || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO room_messages (room_id, user_id, username, content) VALUES (?, ?, ?, ?)',
    [req.params.id, user_id, username, content],
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
