const express = require('express');
const db = require('../db');

const router = express.Router();

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
      res.json(rows);
    }
  );
});

// Get game by ID
router.get('/:id', (req, res) => {
  db.get(
    'SELECT * FROM games WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json(row);
    }
  );
});

// Join a game
router.post('/:id/join', (req, res) => {
  const { player2_id } = req.body;

  db.run(
    'UPDATE games SET player2_id = ? WHERE id = ? AND player2_id IS NULL',
    [player2_id, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to join game' });
      }
      res.json({ success: true });
    }
  );
});

// Make a move
router.post('/:id/move', (req, res) => {
  const { player_id, move } = req.body;

  if (!player_id || !move) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO game_moves (game_id, player_id, move) VALUES (?, ?, ?)',
    [req.params.id, player_id, move],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to record move' });
      }
      res.json({ success: true });
    }
  );
});

// End game / set winner
router.post('/:id/end', (req, res) => {
  const { winner_id } = req.body;

  db.run(
    'UPDATE games SET winner_id = ? WHERE id = ?',
    [winner_id, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to end game' });
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;
