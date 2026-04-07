import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';

export function useSocket() {
  const { socket, isConnected } = useSocketContext();
  const [currentUser, setCurrentUser] = useState(null);
  const [players, setPlayers] = useState(new Map());
  const [chatRooms, setChatRooms] = useState(new Map());
  const [reactions, setReactions] = useState([]); // { userId, emoji, id }
  const playersRef = useRef(new Map());
  const reactionIdRef = useRef(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('player:joined', (data) => {
      if (data.userId === socket.id) {
        setCurrentUser({
          userId: data.userId,
          username: data.username,
          x: data.x,
          y: data.y,
          color: data.color,
        });
      } else {
        playersRef.current.set(data.userId, {
          userId: data.userId,
          username: data.username,
          x: data.x,
          y: data.y,
          targetX: data.x,
          targetY: data.y,
          color: data.color,
          handRaised: false,
        });
        setPlayers(new Map(playersRef.current));
      }
    });

    socket.on('players:list', (list) => {
      const map = new Map();
      list.forEach((p) => {
        map.set(p.userId, {
          ...p,
          targetX: p.x,
          targetY: p.y,
          handRaised: p.handRaised || false,
        });
      });
      playersRef.current = map;
      setPlayers(new Map(map));
    });

    socket.on('player:moved', ({ userId, x, y }) => {
      const player = playersRef.current.get(userId);
      if (player) {
        player.targetX = x;
        player.targetY = y;
        setPlayers(new Map(playersRef.current));
      }
    });

    socket.on('player:left', ({ userId }) => {
      playersRef.current.delete(userId);
      setPlayers(new Map(playersRef.current));
    });

    socket.on('chat:connected', ({ roomId, peerUserId, peerUsername }) => {
      setChatRooms((prev) => {
        const next = new Map(prev);
        next.set(roomId, { peerUserId, peerUsername, messages: [] });
        return next;
      });
      socket.emit('chat:history', { roomId });
    });

    socket.on('chat:disconnected', ({ roomId }) => {
      setChatRooms((prev) => {
        const next = new Map(prev);
        next.delete(roomId);
        return next;
      });
    });

    socket.on('chat:message', (msg) => {
      setChatRooms((prev) => {
        const next = new Map(prev);
        const room = next.get(msg.roomId);
        if (room) {
          next.set(msg.roomId, { ...room, messages: [...room.messages, msg] });
        }
        return next;
      });
    });

    socket.on('chat:history', ({ roomId, messages }) => {
      setChatRooms((prev) => {
        const next = new Map(prev);
        const room = next.get(roomId);
        if (room) {
          next.set(roomId, { ...room, messages: [...messages, ...room.messages] });
        }
        return next;
      });
    });

    // Emoji reactions
    socket.on('player:reaction', ({ userId, emoji }) => {
      const id = ++reactionIdRef.current;
      setReactions((prev) => [...prev, { userId, emoji, id }]);
      // Auto-remove after 3s
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 3000);
    });

    // Hand raise
    socket.on('player:hand', ({ userId, raised }) => {
      const player = playersRef.current.get(userId);
      if (player) {
        player.handRaised = raised;
        setPlayers(new Map(playersRef.current));
      }
    });

    return () => {
      socket.off('player:joined');
      socket.off('players:list');
      socket.off('player:moved');
      socket.off('player:left');
      socket.off('chat:connected');
      socket.off('chat:disconnected');
      socket.off('chat:message');
      socket.off('chat:history');
      socket.off('player:reaction');
      socket.off('player:hand');
    };
  }, [socket]);

  const joinGame = useCallback(
    (username) => { if (socket) socket.emit('player:join', { username }); },
    [socket]
  );

  const movePlayer = useCallback(
    (x, y) => { if (socket) socket.emit('player:move', { x, y }); },
    [socket]
  );

  const sendMessage = useCallback(
    (roomId, message) => { if (socket) socket.emit('player:chat', { message, roomId }); },
    [socket]
  );

  const sendReaction = useCallback(
    (emoji) => { if (socket) socket.emit('player:reaction', { emoji }); },
    [socket]
  );

  const toggleHand = useCallback(
    (raised) => { if (socket) socket.emit('player:hand', { raised }); },
    [socket]
  );

  return {
    socket,
    isConnected,
    currentUser,
    setCurrentUser,
    players,
    playersRef,
    chatRooms,
    reactions,
    joinGame,
    movePlayer,
    sendMessage,
    sendReaction,
    toggleHand,
  };
}
