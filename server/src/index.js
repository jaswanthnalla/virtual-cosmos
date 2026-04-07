import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import { registerSocketHandlers } from './socket/handlers.js';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

import User from './models/User.js';

app.get('/', (_req, res) => {
  res.json({ status: 'Virtual Cosmos server running' });
});

// GET /api/users — view all tracked users with positions
app.get('/api/users', async (_req, res) => {
  try {
    const users = await User.find({}).sort({ updatedAt: -1 }).lean();
    res.json({
      total: users.length,
      online: users.filter((u) => u.isOnline).length,
      users: users.map((u) => ({
        socketId: u.socketId,
        username: u.username,
        position: u.position,
        activeConnections: u.activeConnections,
        isOnline: u.isOnline,
        lastUpdated: u.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/online — only online users
app.get('/api/users/online', async (_req, res) => {
  try {
    const users = await User.find({ isOnline: true }).lean();
    res.json({
      count: users.length,
      users: users.map((u) => ({
        socketId: u.socketId,
        username: u.username,
        position: u.position,
        activeConnections: u.activeConnections,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  registerSocketHandlers(io, socket);
});

// Connect to MongoDB (non-blocking — server starts even if DB is unavailable)
connectDB().catch((err) => {
  console.warn('MongoDB not available — chat history will not persist:', err.message);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
