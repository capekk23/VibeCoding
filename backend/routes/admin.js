const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id']; // Simple auth for this prototype
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await db.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (result.rows[0] && result.rows[0].is_admin) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Admin rights required' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete a user and all their associated data
router.delete('/users/:id', isAdmin, async (req, res) => {
  const targetId = req.params.id;
  try {
    await db.query('BEGIN');
    // Delete moves, messages, room messages, DMs, memberships
    await db.query('DELETE FROM game_moves WHERE player_id = $1', [targetId]);
    await db.query('DELETE FROM messages WHERE user_id = $1', [targetId]);
    await db.query('DELETE FROM room_messages WHERE user_id = $1', [targetId]);
    await db.query('DELETE FROM room_members WHERE user_id = $1', [targetId]);
    await db.query('DELETE FROM direct_messages WHERE from_user_id = $1 OR to_user_id = $1', [targetId]);
    // Delete user
    await db.query('DELETE FROM users WHERE id = $1', [targetId]);
    await db.query('COMMIT');
    res.json({ success: true, message: `User ${targetId} deleted` });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete a room and its messages
router.delete('/rooms/:id', isAdmin, async (req, res) => {
  const roomId = req.params.id;
  try {
    await db.query('BEGIN');
    await db.query('DELETE FROM room_messages WHERE room_id = $1', [roomId]);
    await db.query('DELETE FROM room_members WHERE room_id = $1', [roomId]);
    await db.query('DELETE FROM rooms WHERE id = $1', [roomId]);
    await db.query('COMMIT');
    res.json({ success: true, message: `Room ${roomId} deleted` });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// Clear global messages
router.delete('/messages/clear', isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM messages');
    res.json({ success: true, message: 'Global messages cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

module.exports = router;
