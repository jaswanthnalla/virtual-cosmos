import { calculateDistance, generateRoomId } from '../utils/helpers.js';
import User from '../models/User.js';

const PROXIMITY_RADIUS = 150;

// Persist connections to DB (non-blocking)
async function syncConnectionsToDB(socketId, connections) {
  try {
    await User.findOneAndUpdate(
      { socketId },
      { activeConnections: Array.from(connections) }
    );
  } catch (err) {
    // Silent fail — in-memory state is authoritative
  }
}

export function checkProximity(io, movingSocket, players) {
  const movingPlayer = players.get(movingSocket.id);
  if (!movingPlayer) return;

  for (const [socketId, otherPlayer] of players) {
    if (socketId === movingSocket.id) continue;

    const distance = calculateDistance(movingPlayer.position, otherPlayer.position);
    const roomId = generateRoomId(movingSocket.id, socketId);
    const isConnected = movingPlayer.activeConnections.has(roomId);

    if (distance < PROXIMITY_RADIUS && !isConnected) {
      // ─── Connect ────────────────────────────────────────
      movingPlayer.activeConnections.add(roomId);
      otherPlayer.activeConnections.add(roomId);

      movingSocket.join(roomId);
      const otherSocket = io.sockets.sockets.get(socketId);
      if (otherSocket) otherSocket.join(roomId);

      console.log(`[Proximity] Connected: ${movingPlayer.username} <-> ${otherPlayer.username} (${Math.round(distance)}px)`);

      movingSocket.emit('chat:connected', {
        roomId,
        peerUserId: socketId,
        peerUsername: otherPlayer.username,
      });

      if (otherSocket) {
        otherSocket.emit('chat:connected', {
          roomId,
          peerUserId: movingSocket.id,
          peerUsername: movingPlayer.username,
        });
      }

      // Persist to DB
      syncConnectionsToDB(movingSocket.id, movingPlayer.activeConnections);
      syncConnectionsToDB(socketId, otherPlayer.activeConnections);

    } else if (distance >= PROXIMITY_RADIUS && isConnected) {
      // ─── Disconnect ─────────────────────────────────────
      movingPlayer.activeConnections.delete(roomId);
      otherPlayer.activeConnections.delete(roomId);

      movingSocket.leave(roomId);
      const otherSocket = io.sockets.sockets.get(socketId);
      if (otherSocket) otherSocket.leave(roomId);

      console.log(`[Proximity] Disconnected: ${movingPlayer.username} <-> ${otherPlayer.username} (${Math.round(distance)}px)`);

      movingSocket.emit('chat:disconnected', { roomId });
      if (otherSocket) {
        otherSocket.emit('chat:disconnected', { roomId });
      }

      // Persist to DB
      syncConnectionsToDB(movingSocket.id, movingPlayer.activeConnections);
      syncConnectionsToDB(socketId, otherPlayer.activeConnections);
    }
  }
}
