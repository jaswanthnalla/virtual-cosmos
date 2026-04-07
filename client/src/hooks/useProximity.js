import { useMemo } from 'react';
import { calculateDistance } from '../utils/helpers';
import { PROXIMITY_RADIUS } from '../utils/constants';

export function useProximity(currentUser, players) {
  const nearbyPlayers = useMemo(() => {
    if (!currentUser) return [];
    const nearby = [];
    for (const [, player] of players) {
      const dist = calculateDistance(currentUser, player);
      if (dist < PROXIMITY_RADIUS) {
        nearby.push(player);
      }
    }
    return nearby;
  }, [currentUser, players]);

  return { nearbyPlayers };
}
