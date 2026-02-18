const express = require('express');
const db = require('../db');
const crypto = require('crypto');

const router = express.Router();

// Multiplayer racing sessions
const raceSessions = {};

// Create a new game
router.post('/', (req, res) => {
  const { game_type, player1_id } = req.body;

  if (!game_type || !player1_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO games (game_type, player1_id, state) VALUES (?, ?, ?)',
    [game_type, player1_id, '{}'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create game' });
      }
      res.json({ id: this.lastID, game_type, player1_id });
    }
  );
});

// Get active games
router.get('/', (req, res) => {
  db.all(
    'SELECT id, game_type, player1_id, player2_id, winner_id FROM games WHERE winner_id IS NULL ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch games' });
      }
      res.json(rows || []);
    }
  );
});

// Get game by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    'SELECT * FROM games WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch game' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json(row);
    }
  );
});

// Multiplayer Racing - Create session
router.post('/race/create', (req, res) => {
  const { userId } = req.body;
  const sessionId = crypto.randomBytes(8).toString('hex');
  raceSessions[sessionId] = {
    players: [{ userId, x: 550, score: 0, avoided: 0 }],
    roadSpeed: 3,
    seed: Math.floor(Math.random() * 10000),
    createdAt: Date.now()
  };
  res.json({ sessionId });
});

// Multiplayer Racing - Join session
router.post('/race/join', (req, res) => {
  const { sessionId, userId } = req.body;
  if (raceSessions[sessionId] && raceSessions[sessionId].players.length < 2) {
    raceSessions[sessionId].players.push({ userId, x: 650, score: 0, avoided: 0 });
    res.json({ success: true, seed: raceSessions[sessionId].seed });
  } else {
    res.status(400).json({ error: 'Session not available' });
  }
});

// Multiplayer Racing - Update player position
router.post('/race/update', (req, res) => {
  const { sessionId, userId, x, score, avoided } = req.body;
  if (raceSessions[sessionId]) {
    const player = raceSessions[sessionId].players.find(p => p.userId === userId);
    if (player) {
      player.x = x;
      player.score = score;
      player.avoided = avoided;
      res.json({ 
        seed: raceSessions[sessionId].seed,
        players: raceSessions[sessionId].players,
        roadSpeed: raceSessions[sessionId].roadSpeed
      });
    }
  }
});

// Multiplayer Racing - Get session state
router.get('/race/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (raceSessions[sessionId]) {
    res.json(raceSessions[sessionId]);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

module.exports = router;
