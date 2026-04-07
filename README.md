# Virtual Cosmos

A real-time 2D virtual environment where users move around as avatars and interact through **proximity-based chat and voice**. When users come close to each other, chat and voice connections automatically open. When they move apart, connections close — simulating real-world proximity interaction in a virtual space.

> Inspired by [Cosmos.video](https://cosmos.video)

![Virtual Cosmos Screenshot](https://img.shields.io/badge/status-live-brightgreen)

---

## Features

### Core Features
- **2D Virtual Space** — PixiJS-rendered office environment with rooms, furniture, rugs, plants, and room labels
- **Real-Time Movement** — WASD/Arrow key movement with smooth lerp interpolation for other players
- **Proximity Detection** — Server-authoritative proximity detection (150px radius); when two users are within range, they auto-connect
- **Text Chat** — Auto-opening chat panel when users are nearby; disappears when they move apart
- **Voice Chat (WebRTC)** — Peer-to-peer voice communication that auto-connects on proximity using WebRTC with STUN servers
- **Message Persistence** — All chat messages saved to MongoDB with history loaded on reconnection

### UI Features (Cosmos.video-style)
- **Top Toolbar** — Space name, mic toggle, speaker toggle, call status indicator, user count, fullscreen
- **Bottom Toolbar** — Share (copy link), Invite, Move mode, Hand raise, Emoji reactions, Chat toggle, Apps
- **Cartoon Avatars** — Cute character avatars with faces, hair, colored bodies, name badges, and online indicators
- **Emoji Reactions** — 8 floating emoji reactions (👍👏❤️😂🎉👋🔥🤔) visible to all users
- **Hand Raise** — Raise/lower hand indicator (✋) shown above avatar
- **Right-side Chat Panel** — Slack-style chat with tabs for multiple connections, timestamps, formatting toolbar

### Backend Features
- **MongoDB Tracking** — Persists `userId`, `position (x, y)`, `activeConnections`, and `isOnline` status
- **REST API** — `/api/users` and `/api/users/online` endpoints to view tracked user data
- **WebRTC Signaling** — Socket.IO relay for WebRTC offer/answer/ICE candidate exchange
- **Graceful Cleanup** — On disconnect, connections are cleaned up and user is marked offline in DB

---

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 18 (Vite) + PixiJS 7 + Tailwind CSS |
| Backend  | Node.js (Express) + Socket.IO 4        |
| Database | MongoDB (Mongoose 8)                    |
| Voice    | WebRTC (peer-to-peer) + STUN servers    |

---

## Project Structure

```
virtual-cosmos/
├── client/                          # React + PixiJS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx           # PixiJS canvas with office room, avatars, proximity circles
│   │   │   ├── TopToolbar.jsx       # Mic, speaker, call, user count, fullscreen
│   │   │   ├── BottomToolbar.jsx    # Share, invite, move, hand, react, chat, apps
│   │   │   ├── ChatPanel.jsx        # Right-side proximity chat panel
│   │   │   ├── UsernameInput.jsx    # Login screen
│   │   │   ├── GameView.jsx         # Main game layout wiring all components
│   │   │   ├── ReactionOverlay.jsx  # Floating emoji reactions
│   │   │   └── ErrorBoundary.jsx    # Error boundary for PixiJS canvas
│   │   ├── hooks/
│   │   │   ├── useSocket.js         # Socket.IO state management (players, chat, reactions)
│   │   │   ├── useMovement.js       # Keyboard movement with WASD/Arrow keys
│   │   │   ├── useProximity.js      # Client-side proximity calculation
│   │   │   └── useVoiceChat.js      # WebRTC peer connections and audio streams
│   │   ├── context/
│   │   │   └── SocketContext.jsx     # Socket.IO provider
│   │   ├── utils/
│   │   │   ├── constants.js         # World size, avatar radius, proximity radius
│   │   │   └── helpers.js           # Distance calc, HSL-to-hex, lerp
│   │   └── styles/
│   │       └── index.css            # Tailwind + custom animations
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                          # Express + Socket.IO backend
│   ├── src/
│   │   ├── index.js                 # Express server + Socket.IO + REST API
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js              # User schema (socketId, position, connections, isOnline)
│   │   │   └── Message.js           # Chat message schema (roomId, sender, content)
│   │   ├── socket/
│   │   │   ├── handlers.js          # All socket event handlers + WebRTC signaling
│   │   │   └── proximity.js         # Server-side proximity detection logic
│   │   └── utils/
│   │       └── helpers.js           # Distance calc, room ID generation, color generation
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **MongoDB** running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) URI
- **Git** ([download](https://git-scm.com))

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/jaswanthnalla/virtual-cosmos.git
cd virtual-cosmos
```

### 2. Server setup

```bash
cd server
npm install
```

Create a `.env` file (or copy the example):

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/virtual-cosmos
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

The server starts on **http://localhost:3001**.

### 3. Client setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The client starts on **http://localhost:5173**.

---

## How to Test

1. Open **2 or more browser tabs** at `http://localhost:5173`
2. Enter a **different username** in each tab
3. Use **WASD** or **Arrow keys** to move your avatar
4. Move two avatars **close together** (within the proximity circle)
5. **Chat panel** will automatically appear — send messages back and forth
6. **Voice chat** will auto-connect — speak through your microphone (allow mic permission)
7. Click **Hand** to raise your hand (✋ appears above avatar)
8. Click **React** to send emoji reactions visible to all
9. Move the avatars **apart** — chat and voice automatically disconnect
10. Close a tab — avatar is removed and connections are cleaned up

### Verify MongoDB Tracking

While users are connected, visit:

```
http://localhost:3001/api/users
```

This returns all tracked users with their `userId`, `position (x, y)`, `activeConnections`, and `isOnline` status.

---

## Socket Events

| Direction        | Event                | Purpose                            |
| ---------------- | -------------------- | ---------------------------------- |
| Client → Server  | `player:join`        | Join with username                 |
| Client → Server  | `player:move`        | Send position update               |
| Client → Server  | `player:chat`        | Send chat message                  |
| Client → Server  | `player:reaction`    | Send emoji reaction                |
| Client → Server  | `player:hand`        | Raise/lower hand                   |
| Client → Server  | `webrtc:offer`       | WebRTC voice call offer            |
| Client → Server  | `webrtc:answer`      | WebRTC voice call answer           |
| Client → Server  | `webrtc:ice-candidate` | ICE candidate for WebRTC         |
| Server → Client  | `player:joined`      | New player announcement            |
| Server → Client  | `player:moved`       | Position broadcast                 |
| Server → Client  | `player:left`        | Player disconnect                  |
| Server → Client  | `players:list`       | All current players                |
| Server → Client  | `chat:connected`     | Proximity chat opened              |
| Server → Client  | `chat:disconnected`  | Proximity chat closed              |
| Server → Client  | `chat:message`       | New chat message                   |
| Server → Client  | `chat:history`       | Chat history for a room            |

---

## REST API

| Method | Endpoint           | Description                        |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/`                | Server health check                |
| GET    | `/api/users`       | All users with positions & status  |
| GET    | `/api/users/online`| Only online users                  |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐ │
│  │  PixiJS  │  │ useSocket│  │useVoiceChat│  │  Chat  │ │
│  │  Canvas  │  │  (state) │  │  (WebRTC)  │  │ Panel  │ │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘  └───┬────┘ │
│       │              │              │              │      │
│       └──────────────┴──────────────┴──────────────┘      │
│                          │ Socket.IO                      │
└──────────────────────────┼────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────┐
│                      Server (Express)                     │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│  │ Socket.IO    │  │  Proximity  │  │ WebRTC Signaling │ │
│  │ Handlers     │──│  Detection  │  │ (offer/answer)   │ │
│  └──────┬───────┘  └──────┬──────┘  └──────────────────┘ │
│         │                 │                               │
│         └─────────┬───────┘                               │
│                   │                                       │
│         ┌─────────▼─────────┐                             │
│         │     MongoDB       │                             │
│         │  Users | Messages │                             │
│         └───────────────────┘                             │
└───────────────────────────────────────────────────────────┘
```

---

## License

MIT
