# 📡 DEEP SPACE RELAY 📡

A retro-futuristic web app with a 90s cyberpunk aesthetic. Features user authentication, real-time messaging, and multiplayer mini-games.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)

### Installation

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Build frontend
cd frontend && npm run build && cd ..
```

### Running

```bash
# Start the server (port 3000)
npm start
```

Then open http://localhost:3000 in your browser.

## 🎮 Features

### Authentication
- User registration and login
- Token-based session management

### Messaging
- Real-time chat with all connected users
- Message history
- Timestamp tracking

### Mini-Games
1. **Tic Tac Toe** - Classic 3x3 grid game
2. **Rock Paper Scissors** - Play against AI
3. **Number Guess** - Guess the secret number (1-100)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- SQLite database
- CORS enabled

### Frontend
- React 19
- Vite build tool
- Custom 90s cyberpunk CSS

## 📁 Project Structure

```
VibeCoding/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── games.js
│   └── app.db (SQLite database)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── components/
│   │   ├── styles/cyberpunk.css
│   │   └── games/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── public/ (built frontend)
└── package.json
```

## 🎨 Design

The app features a distinctive 90s cyberpunk aesthetic with:
- Neon cyan, magenta, and lime green colors
- Grid background with scanline effects
- Glowing text shadows
- Geometric typography (Orbitron, Space Mono)
- Futuristic UI elements

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send a message

### Games
- `POST /api/games` - Create new game
- `GET /api/games` - Get all active games
- `GET /api/games/:id` - Get game details
- `POST /api/games/:id/join` - Join a game
- `POST /api/games/:id/move` - Make a game move
- `POST /api/games/:id/end` - End game / set winner

## 🧪 Testing

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"pass123"}'

# Send message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"username":"player1","content":"Hello!"}'
```

## 📦 Development

### Build frontend for production
```bash
cd frontend && npm run build
```

### Run frontend dev server (hot reload)
```bash
cd frontend && npm run dev
```

## 🎓 This is a Learning Project

Perfect for class projects and learning full-stack web development with:
- Frontend frameworks (React)
- Backend frameworks (Express)
- Database design (SQLite)
- API design and REST principles
- Real-time communication patterns
- Game logic implementation

---

**Made with ⚡ and neon glow** 🌟

**🔴 Updated by Robot on 2026-02-18**
