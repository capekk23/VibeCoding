// OpenChat Backend
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import authRoutes from './routes/authRoutes';
import serverRoutes from './routes/serverRoutes';
import uploadRoutes from './routes/uploadRoutes';
import messageRoutes from './routes/messageRoutes';
import { registerMessageHandlers } from './socket/messageHandler';
import { socketAuthMiddleware } from './socket/socketAuthMiddleware';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/openchat';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io
io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  registerMessageHandlers(io, socket);
  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
