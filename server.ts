import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { RoomState } from './src/types/game.ts';
import { applyRoomAction, generateRoomCode } from './src/utils/roomStateMachine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rooms = new Map<string, RoomState>();
const clientRooms = new Map<WebSocket, { roomId: string; playerId: string }>();

function broadcastRoomState(wss: WebSocketServer, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const payload = JSON.stringify({ type: 'room:state', state: room });
  wss.clients.forEach((client) => {
    const info = clientRooms.get(client);
    if (client.readyState === WebSocket.OPEN && info?.roomId === roomId) client.send(payload);
  });
}

function handleServerRoomAction(msg: Record<string, any>, wss: WebSocketServer) {
  const type = String(msg.type || '');

  if (type === 'room:create') {
    let roomId = String(msg.roomId || generateRoomCode()).toUpperCase().trim();
    if (!msg.roomId) {
      while (rooms.has(roomId)) roomId = generateRoomCode();
    }
    const res = applyRoomAction(null, { ...msg, roomId });
    if (res.ok && res.room) {
      rooms.set(roomId, res.room);
      broadcastRoomState(wss, roomId);
      return { ok: true, roomId, playerId: res.playerId, state: res.room };
    }
    return { ok: false, message: 'Gagal membuat room.' };
  }

  const roomId = String(msg.roomId || '').toUpperCase().trim();
  if (type === 'room:sync' && msg.state && roomId) {
    rooms.set(roomId, msg.state as RoomState);
    broadcastRoomState(wss, roomId);
    return { ok: true, roomId, state: msg.state as RoomState };
  }

  const existingRoom = rooms.get(roomId) || null;
  const res = applyRoomAction(existingRoom, msg);
  if (!res.ok || !res.room) {
    return { ok: false, message: res.message || 'Room tidak ditemukan.' };
  }

  rooms.set(roomId, res.room);
  broadcastRoomState(wss, roomId);
  return { ok: true, roomId, playerId: res.playerId, state: res.room };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', activeRooms: rooms.size }));

  app.get('/api/room/:roomId', (req, res) => {
    const roomId = String(req.params.roomId || '').toUpperCase().trim();
    const room = rooms.get(roomId);
    if (!room) return res.status(404).json({ ok: false, message: 'Room tidak ditemukan.' });
    res.json({ ok: true, state: room });
  });

  app.post('/api/room', (req, res) => {
    const result = handleServerRoomAction(req.body || {}, wss);
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (raw: string) => {
      try {
        const msg = JSON.parse(raw.toString());
        const existingInfo = clientRooms.get(ws);
        if (!msg.roomId && existingInfo?.roomId) msg.roomId = existingInfo.roomId;

        const result = handleServerRoomAction(msg, wss);
        if (!result.ok) {
          ws.send(JSON.stringify({ type: 'room:error', message: result.message }));
          return;
        }
        if ((msg.type === 'room:create' || msg.type === 'room:join') && result.roomId && result.playerId && result.state) {
          clientRooms.set(ws, { roomId: result.roomId, playerId: result.playerId });
          ws.send(JSON.stringify({ type: 'room:joined', roomId: result.roomId, playerId: result.playerId, state: result.state }));
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      const info = clientRooms.get(ws);
      if (info) {
        const room = rooms.get(info.roomId);
        if (room) {
          const p = room.players.find((pl) => pl.id === info.playerId);
          if (p) p.connected = false;
          broadcastRoomState(wss, info.roomId);
        }
        clientRooms.delete(ws);
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
