const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'app.db'));

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Messages table (for global chat)
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Chat rooms table
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      creator_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    )
  `);

  // Room members table
  db.run(`
    CREATE TABLE IF NOT EXISTS room_members (
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Room messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS room_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Direct messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS direct_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      from_username TEXT NOT NULL,
      to_username TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    )
  `);

  // Games table
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_type TEXT NOT NULL,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER,
      state TEXT DEFAULT '{}',
      winner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player1_id) REFERENCES users(id),
      FOREIGN KEY (player2_id) REFERENCES users(id)
    )
  `);

  // Game moves table
  db.run(`
    CREATE TABLE IF NOT EXISTS game_moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      move TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (player_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;
