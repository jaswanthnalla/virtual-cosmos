import { useEffect, useRef, useCallback } from 'react';
import {
  MOVE_SPEED,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  AVATAR_RADIUS,
  POSITION_UPDATE_RATE,
} from '../utils/constants';

export function useMovement(currentUser, setCurrentUser, movePlayer) {
  const keysPressed = useRef(new Set());
  const lastEmit = useRef(0);

  const handleKeyDown = useCallback((e) => {
    if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      keysPressed.current.add(e.key);
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animId;
    const loop = () => {
      const keys = keysPressed.current;
      let dx = 0;
      let dy = 0;

      if (keys.has('w') || keys.has('ArrowUp')) dy -= MOVE_SPEED;
      if (keys.has('s') || keys.has('ArrowDown')) dy += MOVE_SPEED;
      if (keys.has('a') || keys.has('ArrowLeft')) dx -= MOVE_SPEED;
      if (keys.has('d') || keys.has('ArrowRight')) dx += MOVE_SPEED;

      if (dx !== 0 || dy !== 0) {
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const newX = Math.max(
            AVATAR_RADIUS,
            Math.min(WORLD_WIDTH - AVATAR_RADIUS, prev.x + dx)
          );
          const newY = Math.max(
            AVATAR_RADIUS,
            Math.min(WORLD_HEIGHT - AVATAR_RADIUS, prev.y + dy)
          );

          const now = Date.now();
          if (now - lastEmit.current >= POSITION_UPDATE_RATE) {
            lastEmit.current = now;
            movePlayer(newX, newY);
          }

          return { ...prev, x: newX, y: newY };
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentUser, setCurrentUser, movePlayer, handleKeyDown, handleKeyUp]);
}
