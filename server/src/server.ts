import fs from 'fs';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import { RoomManager } from './game/RoomManager';
import { db, UserRecord } from './db/database';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager(io);

// ---------------- REST API ----------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/rooms', (req, res) => {
  res.json(roomManager.listPublicRooms());
});

app.get('/api/leaderboard', (req, res) => {
  res.json(db.getLeaderboard(15));
});

// Guest Login / Register
app.post('/api/auth/guest', (req, res) => {
  const { username, avatar } = req.body;
  const name = (username || `Player_${Math.floor(1000 + Math.random() * 9000)}`).trim();
  const id = `guest-${uuidv4().substring(0, 8)}`;

  const user: UserRecord = {
    id,
    username: name,
    avatar: avatar || 'spade',
    isGuest: true,
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    createdAt: new Date().toISOString(),
  };

  db.saveUser(user);
  res.json({ success: true, user });
});

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { username, password, avatar } = req.body;
  if (!username || !password || username.length < 3 || password.length < 4) {
    return res.status(400).json({ error: 'Username (min 3 chars) and Password (min 4 chars) required.' });
  }

  const existing = db.getUserByUsername(username);
  if (existing && !existing.isGuest) {
    return res.status(409).json({ error: 'Username is already taken.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const id = `user-${uuidv4().substring(0, 8)}`;

  const user: UserRecord = {
    id,
    username: username.trim(),
    passwordHash,
    avatar: avatar || 'spade',
    isGuest: false,
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    createdAt: new Date().toISOString(),
  };

  db.saveUser(user);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// User Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' });
  }

  const user = db.getUserByUsername(username);
  if (!user || !user.passwordHash || user.isGuest) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Serve frontend in production
const possibleDistPaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../../../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
];
const clientDist = possibleDistPaths.find((p) => fs.existsSync(p)) || possibleDistPaths[0];
console.log(`[Server] Serving static client from: ${clientDist}`);
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

// ---------------- WebSocket Handlers ----------------

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('create_room', ({ roomName, playerName, avatar, fillBots }) => {
    const playerId = socket.handshake.auth.playerId || `p-${socket.id.substring(0, 6)}`;
    const { room, error } = roomManager.createRoom(
      playerId,
      socket.id,
      playerName || 'Player',
      roomName,
      fillBots !== false,
      avatar || 'spade'
    );

    if (error) {
      socket.emit('play_error', error);
      return;
    }

    socket.join(room.code);
    room.broadcastState();
    if (room.status === 'PLAYING') {
      room.sendIndividualHands();
    }
  });

  socket.on('join_room', ({ roomCode, playerName, avatar }) => {
    const playerId = socket.handshake.auth.playerId || `p-${socket.id.substring(0, 6)}`;
    const { room, error } = roomManager.joinRoom(
      roomCode,
      playerId,
      socket.id,
      playerName || 'Player',
      avatar || 'spade'
    );

    if (error || !room) {
      socket.emit('play_error', error || 'Failed to join room.');
      return;
    }

    socket.join(room.code);
    room.broadcastState();
    if (room.status === 'PLAYING') {
      room.sendIndividualHands();
    }
  });

  socket.on('toggle_ready', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.toggleReady(socket.id);
    }
  });

  socket.on('toggle_bot_fill', (fill) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room && socket.id === room.seats.find((s) => s && s.id === room.hostId)?.socketId) {
      room.setBotFill(fill);
    }
  });

  socket.on('start_game', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room && socket.id === room.seats.find((s) => s && s.id === room.hostId)?.socketId) {
      room.startRound();
    }
  });

  socket.on('play_cards', (cardIds) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) {
      socket.emit('play_error', 'You are not in an active room.');
      return;
    }

    const result = room.playCards(socket.id, cardIds);
    if (!result.success && result.error) {
      socket.emit('play_error', result.error);
    }
  });

  socket.on('pass_turn', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) {
      socket.emit('play_error', 'You are not in an active room.');
      return;
    }

    const result = room.passTurn(socket.id);
    if (!result.success && result.error) {
      socket.emit('play_error', result.error);
    }
  });

  socket.on('send_chat', (text) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !text || text.trim().length === 0) return;

    const player = room.seats.find((s) => s && s.socketId === socket.id);
    const sender = player ? player.name : 'Spectator';

    io.to(room.code).emit('chat_message', {
      sender,
      text: text.trim().substring(0, 150),
      timestamp: Date.now(),
    });
  });

  socket.on('request_rematch', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.requestRematch();
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Big Two Game Server listening on port ${PORT}`);
});
