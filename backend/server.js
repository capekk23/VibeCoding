const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');
const gamesRoutes = require('./routes/games');
const roomsRoutes = require('./routes/rooms');
const dmRoutes = require('./routes/dm');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/dm', dmRoutes);

// Serve static files from public directory (built frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Fallback to index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
