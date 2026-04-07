import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { WORLD_WIDTH, WORLD_HEIGHT, PROXIMITY_RADIUS, AVATAR_RADIUS } from '../utils/constants';
import { hslToHex, lerp } from '../utils/helpers';

// Colors
const FLOOR_COLOR = 0xd4a574;
const FLOOR_DARK = 0xc4955a;
const WALL_COLOR = 0x8b7355;
const WALL_TOP = 0xa08060;
const ROOM_DIVIDER = 0x9b8b75;
const FURNITURE_COLOR = 0x6b5b4f;
const TABLE_COLOR = 0x8b6914;
const PLANT_GREEN = 0x4a7c59;
const RUG_COLOR = 0xb85c5c;

function drawRoom(container) {
  // Floor base
  const floor = new PIXI.Graphics();
  floor.beginFill(FLOOR_COLOR);
  floor.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  floor.endFill();
  container.addChild(floor);

  // Wood plank lines
  const planks = new PIXI.Graphics();
  planks.lineStyle(1, FLOOR_DARK, 0.3);
  for (let y = 0; y < WORLD_HEIGHT; y += 40) {
    planks.moveTo(0, y);
    planks.lineTo(WORLD_WIDTH, y);
  }
  for (let x = 0; x < WORLD_WIDTH; x += 120) {
    for (let y = 0; y < WORLD_HEIGHT; y += 40) {
      const offset = (Math.floor(y / 40) % 2) * 60;
      planks.moveTo(x + offset, y);
      planks.lineTo(x + offset, y + 40);
    }
  }
  container.addChild(planks);

  // Walls (top and left)
  const walls = new PIXI.Graphics();
  // Top wall
  walls.beginFill(WALL_COLOR);
  walls.drawRect(0, 0, WORLD_WIDTH, 60);
  walls.endFill();
  walls.beginFill(WALL_TOP);
  walls.drawRect(0, 55, WORLD_WIDTH, 10);
  walls.endFill();
  // Left wall
  walls.beginFill(WALL_COLOR);
  walls.drawRect(0, 0, 60, WORLD_HEIGHT);
  walls.endFill();
  walls.beginFill(WALL_TOP);
  walls.drawRect(55, 0, 10, WORLD_HEIGHT);
  walls.endFill();
  container.addChild(walls);

  // Room dividers
  const dividers = new PIXI.Graphics();
  dividers.beginFill(ROOM_DIVIDER);
  // Horizontal divider
  dividers.drawRect(60, 900, 800, 16);
  dividers.drawRect(1000, 900, WORLD_WIDTH - 1000, 16);
  // Vertical divider
  dividers.drawRect(1100, 60, 16, 500);
  dividers.endFill();
  container.addChild(dividers);

  // Room labels
  const rooms = [
    { name: 'Room 1', x: 500, y: 870, color: 0x4a90d9 },
    { name: 'Room 2', x: 200, y: 870, color: 0xe74c3c },
    { name: 'Lounge', x: 1500, y: 870, color: 0x27ae60 },
  ];
  rooms.forEach((room) => {
    const badge = new PIXI.Graphics();
    badge.beginFill(room.color);
    badge.drawRoundedRect(0, 0, 100, 28, 6);
    badge.endFill();
    badge.x = room.x;
    badge.y = room.y;
    container.addChild(badge);

    const icon = new PIXI.Text('\u{1F4BB}', { fontSize: 14 });
    icon.x = room.x + 6;
    icon.y = room.y + 4;
    container.addChild(icon);

    const label = new PIXI.Text(room.name, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 13,
      fontWeight: '600',
      fill: 0xffffff,
    });
    label.x = room.x + 26;
    label.y = room.y + 5;
    container.addChild(label);
  });

  // Furniture - Tables
  const furniture = new PIXI.Graphics();

  // Conference table (Room 1 area)
  furniture.beginFill(TABLE_COLOR);
  furniture.drawRoundedRect(350, 350, 200, 100, 12);
  furniture.endFill();
  furniture.beginFill(0x7a5c10);
  furniture.drawRoundedRect(355, 355, 190, 90, 10);
  furniture.endFill();

  // Desks (Room 2 area)
  furniture.beginFill(TABLE_COLOR);
  furniture.drawRoundedRect(150, 1050, 120, 60, 8);
  furniture.endFill();
  furniture.beginFill(0x7a5c10);
  furniture.drawRoundedRect(153, 1053, 114, 54, 6);
  furniture.endFill();

  furniture.beginFill(TABLE_COLOR);
  furniture.drawRoundedRect(350, 1050, 120, 60, 8);
  furniture.endFill();
  furniture.beginFill(0x7a5c10);
  furniture.drawRoundedRect(353, 1053, 114, 54, 6);
  furniture.endFill();

  // Lounge sofa
  furniture.beginFill(0x5d4e8c);
  furniture.drawRoundedRect(1300, 1050, 250, 80, 16);
  furniture.endFill();
  furniture.beginFill(0x6d5e9c);
  furniture.drawRoundedRect(1310, 1060, 230, 55, 12);
  furniture.endFill();

  // Coffee table
  furniture.beginFill(TABLE_COLOR);
  furniture.drawRoundedRect(1370, 1180, 100, 50, 8);
  furniture.endFill();

  // Right side tables
  furniture.beginFill(TABLE_COLOR);
  furniture.drawRoundedRect(1300, 300, 160, 80, 10);
  furniture.endFill();
  furniture.beginFill(0x7a5c10);
  furniture.drawRoundedRect(1305, 305, 150, 70, 8);
  furniture.endFill();

  container.addChild(furniture);

  // Plants
  const plants = new PIXI.Graphics();
  const plantPositions = [
    { x: 80, y: 80 },
    { x: 80, y: 500 },
    { x: 80, y: 1200 },
    { x: 1800, y: 80 },
    { x: 1800, y: 600 },
    { x: 900, y: 80 },
  ];
  plantPositions.forEach((pos) => {
    // Pot
    plants.beginFill(0x8b4513);
    plants.drawRoundedRect(pos.x - 12, pos.y + 10, 24, 18, 4);
    plants.endFill();
    // Leaves
    plants.beginFill(PLANT_GREEN);
    plants.drawCircle(pos.x, pos.y, 16);
    plants.endFill();
    plants.beginFill(0x5a9c69);
    plants.drawCircle(pos.x - 6, pos.y - 4, 10);
    plants.drawCircle(pos.x + 6, pos.y - 4, 10);
    plants.endFill();
  });
  container.addChild(plants);

  // Rugs
  const rugs = new PIXI.Graphics();
  // Main rug
  rugs.beginFill(RUG_COLOR, 0.4);
  rugs.drawRoundedRect(250, 200, 400, 350, 12);
  rugs.endFill();
  rugs.lineStyle(2, RUG_COLOR, 0.6);
  rugs.drawRoundedRect(260, 210, 380, 330, 10);

  // Lounge rug
  rugs.beginFill(0x5c7eb8, 0.3);
  rugs.drawRoundedRect(1250, 980, 350, 300, 12);
  rugs.endFill();
  rugs.lineStyle(2, 0x5c7eb8, 0.5);
  rugs.drawRoundedRect(1260, 990, 330, 280, 10);
  container.addChild(rugs);

  // Chairs around conference table
  const chairs = new PIXI.Graphics();
  const chairColor = 0x4a4a4a;
  const chairPositions = [
    { x: 380, y: 330 }, { x: 440, y: 330 }, { x: 500, y: 330 },
    { x: 380, y: 460 }, { x: 440, y: 460 }, { x: 500, y: 460 },
  ];
  chairPositions.forEach((pos) => {
    chairs.beginFill(chairColor);
    chairs.drawCircle(pos.x, pos.y, 14);
    chairs.endFill();
    chairs.beginFill(0x555555);
    chairs.drawCircle(pos.x, pos.y, 10);
    chairs.endFill();
  });
  container.addChild(chairs);
}

function drawAvatar(container, username, color, isSelf) {
  const hexColor = typeof color === 'string' ? hslToHex(color) : color;
  const group = new PIXI.Container();

  // Shadow
  const shadow = new PIXI.Graphics();
  shadow.beginFill(0x000000, 0.15);
  shadow.drawEllipse(0, AVATAR_RADIUS + 6, AVATAR_RADIUS * 0.8, 8);
  shadow.endFill();
  group.addChild(shadow);

  // Body (rounded character shape)
  const body = new PIXI.Graphics();
  body.beginFill(hexColor);
  body.drawRoundedRect(-AVATAR_RADIUS, -AVATAR_RADIUS * 1.2, AVATAR_RADIUS * 2, AVATAR_RADIUS * 2.2, AVATAR_RADIUS * 0.6);
  body.endFill();
  group.addChild(body);

  // Face - white area
  const face = new PIXI.Graphics();
  face.beginFill(0xffeedd);
  face.drawRoundedRect(-AVATAR_RADIUS * 0.65, -AVATAR_RADIUS * 0.9, AVATAR_RADIUS * 1.3, AVATAR_RADIUS * 1.1, AVATAR_RADIUS * 0.4);
  face.endFill();
  group.addChild(face);

  // Eyes
  const eyes = new PIXI.Graphics();
  eyes.beginFill(0x333333);
  eyes.drawCircle(-AVATAR_RADIUS * 0.25, -AVATAR_RADIUS * 0.35, 3.5);
  eyes.drawCircle(AVATAR_RADIUS * 0.25, -AVATAR_RADIUS * 0.35, 3.5);
  eyes.endFill();
  // Eye highlights
  eyes.beginFill(0xffffff);
  eyes.drawCircle(-AVATAR_RADIUS * 0.22, -AVATAR_RADIUS * 0.38, 1.5);
  eyes.drawCircle(AVATAR_RADIUS * 0.28, -AVATAR_RADIUS * 0.38, 1.5);
  eyes.endFill();
  group.addChild(eyes);

  // Mouth (smile)
  const mouth = new PIXI.Graphics();
  mouth.lineStyle(2, 0x333333, 0.8);
  mouth.arc(0, -AVATAR_RADIUS * 0.1, 6, 0.2, Math.PI - 0.2);
  group.addChild(mouth);

  // Hair/top detail
  const hair = new PIXI.Graphics();
  const darkerColor = ((hexColor & 0xfefefe) >> 1);
  hair.beginFill(darkerColor);
  hair.drawRoundedRect(-AVATAR_RADIUS * 0.8, -AVATAR_RADIUS * 1.25, AVATAR_RADIUS * 1.6, AVATAR_RADIUS * 0.5, AVATAR_RADIUS * 0.3);
  hair.endFill();
  group.addChild(hair);

  // Username label with background
  const labelBg = new PIXI.Graphics();
  const label = new PIXI.Text(username, {
    fontFamily: 'Inter, Arial, sans-serif',
    fontSize: 12,
    fontWeight: '600',
    fill: 0xffffff,
  });
  label.anchor.set(0.5, 0);
  label.y = AVATAR_RADIUS + 14;

  const padding = 8;
  labelBg.beginFill(0x000000, 0.6);
  labelBg.drawRoundedRect(
    -label.width / 2 - padding,
    AVATAR_RADIUS + 10,
    label.width + padding * 2,
    22,
    11
  );
  labelBg.endFill();

  // Online indicator dot
  const dot = new PIXI.Graphics();
  dot.beginFill(isSelf ? 0x4ade80 : 0xfbbf24);
  dot.drawCircle(-label.width / 2 - padding + 8, AVATAR_RADIUS + 21, 4);
  dot.endFill();

  group.addChild(labelBg);
  group.addChild(dot);
  group.addChild(label);

  container.addChild(group);
  return group;
}

export default function Canvas({ currentUser, players, chatRooms, reactions, isHandRaised }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const avatarsRef = useRef(new Map());
  const currentAvatarRef = useRef(null);
  const proximityCircleRef = useRef(null);
  const connectionLinesRef = useRef(null);
  const handIndicatorsRef = useRef(new Map());
  const reactionBubblesRef = useRef(new Map());
  const [ready, setReady] = useState(false);

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    let destroyed = false;

    const initApp = () => {
      try {
        const app = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: FLOOR_COLOR,
          resizeTo: window,
          antialias: true,
        });

        if (destroyed) {
          app.destroy(true);
          return;
        }

        const canvas = app.view;
        containerRef.current.appendChild(canvas);
        appRef.current = app;

        // Draw room environment
        drawRoom(app.stage);

        // Connection lines layer
        const lines = new PIXI.Graphics();
        app.stage.addChild(lines);
        connectionLinesRef.current = lines;

        // Proximity circle
        const proximityCircle = new PIXI.Graphics();
        app.stage.addChild(proximityCircle);
        proximityCircleRef.current = proximityCircle;

        setReady(true);
      } catch (err) {
        console.error('PixiJS init error:', err);
      }
    };

    initApp();

    return () => {
      destroyed = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // Update current user avatar
  useEffect(() => {
    const app = appRef.current;
    if (!app || !currentUser || !ready) return;

    if (!currentAvatarRef.current) {
      currentAvatarRef.current = drawAvatar(app.stage, currentUser.username, currentUser.color, true);
      currentAvatarRef.current.x = currentUser.x;
      currentAvatarRef.current.y = currentUser.y;
    } else {
      currentAvatarRef.current.x = currentUser.x;
      currentAvatarRef.current.y = currentUser.y;
    }

    // Update proximity circle (subtle, semi-transparent)
    const pc = proximityCircleRef.current;
    if (pc) {
      pc.clear();
      pc.lineStyle(1.5, 0x4a90d9, 0.15);
      pc.drawCircle(currentUser.x, currentUser.y, PROXIMITY_RADIUS);
      pc.beginFill(0x4a90d9, 0.03);
      pc.drawCircle(currentUser.x, currentUser.y, PROXIMITY_RADIUS);
      pc.endFill();
    }

    // Camera follow
    app.stage.pivot.set(currentUser.x, currentUser.y);
    app.stage.position.set(app.screen.width / 2, app.screen.height / 2);

    // Hand raise indicator for self
    const selfHandKey = '__self__';
    if (isHandRaised && !handIndicatorsRef.current.has(selfHandKey)) {
      const hand = new PIXI.Text('\u{270B}', { fontSize: 22 });
      hand.anchor.set(0.5);
      hand.y = -AVATAR_RADIUS * 1.8;
      currentAvatarRef.current.addChild(hand);
      handIndicatorsRef.current.set(selfHandKey, hand);
    } else if (!isHandRaised && handIndicatorsRef.current.has(selfHandKey)) {
      const hand = handIndicatorsRef.current.get(selfHandKey);
      currentAvatarRef.current.removeChild(hand);
      hand.destroy();
      handIndicatorsRef.current.delete(selfHandKey);
    }
  }, [currentUser, ready, isHandRaised]);

  // Update other players with lerp
  useEffect(() => {
    const app = appRef.current;
    if (!app || !ready) return;

    let animId;
    const animate = () => {
      for (const [userId, player] of players) {
        let avatar = avatarsRef.current.get(userId);

        if (!avatar) {
          avatar = drawAvatar(app.stage, player.username, player.color, false);
          avatar.x = player.x;
          avatar.y = player.y;
          avatarsRef.current.set(userId, avatar);
        }

        avatar.x = lerp(avatar.x, player.targetX, 0.15);
        avatar.y = lerp(avatar.y, player.targetY, 0.15);

        // Hand raise indicator
        const hasHand = handIndicatorsRef.current.has(userId);
        if (player.handRaised && !hasHand) {
          const hand = new PIXI.Text('\u{270B}', { fontSize: 22 });
          hand.anchor.set(0.5);
          hand.y = -AVATAR_RADIUS * 1.8;
          avatar.addChild(hand);
          handIndicatorsRef.current.set(userId, hand);
        } else if (!player.handRaised && hasHand) {
          const hand = handIndicatorsRef.current.get(userId);
          avatar.removeChild(hand);
          hand.destroy();
          handIndicatorsRef.current.delete(userId);
        }
      }

      // Remove departed players
      for (const [userId, avatar] of avatarsRef.current) {
        if (!players.has(userId)) {
          app.stage.removeChild(avatar);
          avatar.destroy({ children: true });
          avatarsRef.current.delete(userId);
        }
      }

      // Draw connection lines (dashed-style with dots)
      const lines = connectionLinesRef.current;
      if (lines && currentUser) {
        lines.clear();
        for (const [, room] of chatRooms) {
          const peer = avatarsRef.current.get(room.peerUserId);
          if (peer) {
            // Glowing connection line
            lines.lineStyle(3, 0x4a90d9, 0.2);
            lines.moveTo(currentUser.x, currentUser.y);
            lines.lineTo(peer.x, peer.y);
            lines.lineStyle(1.5, 0x4a90d9, 0.5);
            lines.moveTo(currentUser.x, currentUser.y);
            lines.lineTo(peer.x, peer.y);
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [players, currentUser, chatRooms, ready]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
