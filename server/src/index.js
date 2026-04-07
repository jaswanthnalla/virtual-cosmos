import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import { registerSocketHandlers } from './socket/handlers.js';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const ALLOWED_ORIGINS = [
  ...CLIENT_URL.split(',').map(u => u.trim()),
  'http://localhost:5173',
  'https://client-pi-vert-37.vercel.app',
  'https://client-jassunalla-3342s-projects.vercel.app',
  'https://client-jassunalla-3342-jassunalla-3342s-projects.vercel.app',
];

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, true); // Allow all in dev, restrict in production if needed
    }
  },
  credentials: true,
}));
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
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
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
