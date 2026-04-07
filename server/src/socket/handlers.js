import { generateColor, randomSpawn } from '../utils/helpers.js';
import { checkProximity } from './proximity.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const players = new Map();

// Helper: save/update user in MongoDB (non-blocking)
async function saveUserToDB(socketId, data) {
  try {
    await User.findOneAndUpdate(
      { socketId },
      { ...data, socketId, isOnline: true },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('DB save error:', err.message);
  }
}

async function markUserOffline(socketId) {
  try {
    await User.findOneAndUpdate(
      { socketId },
      { isOnline: false, activeConnections: [] }
    );
  } catch (err) {
    console.error('DB offline error:', err.message);
  }
}

async function updateUserPosition(socketId, x, y) {
  try {
    await User.findOneAndUpdate(
      { socketId },
      { position: { x, y } }
    );
  } catch (err) {
    console.error('DB position error:', err.message);
  }
}

async function updateUserConnections(socketId, connections) {
  try {
    await User.findOneAndUpdate(
      { socketId },
      { activeConnections: Array.from(connections) }
    );
  } catch (err) {
    console.error('DB connections error:', err.message);
  }
}

export function registerSocketHandlers(io, socket) {
  // ─── Player Join ────────────────────────────────────────────
  socket.on('player:join', async ({ username }) => {
    const color = generateColor();
    const position = randomSpawn();

    const player = {
      userId: socket.id,
      username,
      color,
      position,
      activeConnections: new Set(),
      handRaised: false,
    };

    players.set(socket.id, player);

    // Persist to MongoDB
    saveUserToDB(socket.id, {
      username,
      color,
      position: { x: position.x, y: position.y },
      activeConnections: [],
    });

    // Send current players list to the new player
    const playersList = [];
    for (const [id, p] of players) {
      if (id !== socket.id) {
        playersList.push({
          userId: id,
          username: p.username,
          x: p.position.x,
          y: p.position.y,
          color: p.color,
          handRaised: p.handRaised,
        });
      }
    }
    socket.emit('players:list', playersList);

    // Broadcast new player to everyone else
    socket.broadcast.emit('player:joined', {
      userId: socket.id,
      username,
      x: position.x,
      y: position.y,
      color,
    });

    // Confirm join to the player
    socket.emit('player:joined', {
      userId: socket.id,
      username,
      x: position.x,
      y: position.y,
      color,
    });

    console.log(`[Join] ${username} (${socket.id}) at (${position.x}, ${position.y})`);
  });

  // ─── Player Move ────────────────────────────────────────────
  socket.on('player:move', ({ x, y }) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.position.x = x;
    player.position.y = y;

    // Broadcast position to others
    socket.broadcast.emit('player:moved', {
      userId: socket.id,
      x,
      y,
    });

    // Persist position to MongoDB (throttled by client already at ~30fps)
    updateUserPosition(socket.id, x, y);

    // Check proximity for chat/voice connections
    checkProximity(io, socket, players);
  });

  // ─── Chat Message ───────────────────────────────────────────
  socket.on('player:chat', async ({ message, roomId }) => {
    const player = players.get(socket.id);
    if (!player) return;

    const chatMessage = {
      roomId,
      senderId: socket.id,
      senderName: player.username,
      content: message,
      timestamp: Date.now(),
    };

    try {
      await Message.create({
        roomId,
        senderId: socket.id,
        senderName: player.username,
        content: message,
      });
    } catch (err) {
      console.error('Failed to save message:', err.message);
    }

    io.to(roomId).emit('chat:message', chatMessage);
  });

  // ─── Chat History ───────────────────────────────────────────
  socket.on('chat:history', async ({ roomId }) => {
    try {
      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      socket.emit('chat:history', {
        roomId,
        messages: messages.reverse().map((m) => ({
          roomId: m.roomId,
          senderId: m.senderId,
          senderName: m.senderName,
          content: m.content,
          timestamp: m.createdAt,
        })),
      });
    } catch (err) {
      console.error('Failed to load chat history:', err.message);
    }
  });

  // ─── WebRTC Signaling ──────────────────────────────────────
  socket.on('webrtc:offer', ({ targetId, offer }) => {
    console.log(`[WebRTC] Offer from ${socket.id} → ${targetId}`);
    const target = io.sockets.sockets.get(targetId);
    if (target) {
      target.emit('webrtc:offer', { callerId: socket.id, offer });
    }
  });

  socket.on('webrtc:answer', ({ targetId, answer }) => {
    console.log(`[WebRTC] Answer from ${socket.id} → ${targetId}`);
    const target = io.sockets.sockets.get(targetId);
    if (target) {
      target.emit('webrtc:answer', { answererId: socket.id, answer });
    }
  });

  socket.on('webrtc:ice-candidate', ({ targetId, candidate }) => {
    const target = io.sockets.sockets.get(targetId);
    if (target) {
      target.emit('webrtc:ice-candidate', { senderId: socket.id, candidate });
    }
  });

  // ─── Emoji Reactions ───────────────────────────────────────
  socket.on('player:reaction', ({ emoji }) => {
    const player = players.get(socket.id);
    if (!player) return;
    io.emit('player:reaction', { userId: socket.id, emoji });
  });

  // ─── Hand Raise ────────────────────────────────────────────
  socket.on('player:hand', ({ raised }) => {
    const player = players.get(socket.id);
    if (!player) return;
    player.handRaised = raised;
    io.emit('player:hand', { userId: socket.id, raised });
  });

  // ─── Disconnect ────────────────────────────────────────────
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (!player) return;

    console.log(`[Leave] ${player.username} (${socket.id})`);

    // Clean up active connections
    for (const roomId of player.activeConnections) {
      for (const [id, other] of players) {
        if (id !== socket.id && other.activeConnections.has(roomId)) {
          other.activeConnections.delete(roomId);
          updateUserConnections(id, other.activeConnections);
          const otherSocket = io.sockets.sockets.get(id);
          if (otherSocket) {
            otherSocket.leave(roomId);
            otherSocket.emit('chat:disconnected', { roomId });
          }
        }
      }
    }

    players.delete(socket.id);
    io.emit('player:left', { userId: socket.id });

    // Mark offline in MongoDB
    markUserOffline(socket.id);
  });
}
