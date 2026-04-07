export function calculateDistance(pos1, pos2) {
  return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
}

export function generateRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

export function generateColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
}

export function randomSpawn() {
  const margin = 200;
  return {
    x: margin + Math.floor(Math.random() * (2000 - margin * 2)),
    y: margin + Math.floor(Math.random() * (2000 - margin * 2)),
  };
}
