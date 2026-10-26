import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { RoomState, Player, LADDERS, SNAKES, PLAYER_PRESETS, TodType, TodCard, GameLogEntry, drawUniqueTodCard } from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rooms = new Map<string, RoomState>();
const clientRooms = new Map<WebSocket, { roomId: string; playerId: string }>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

function createLog(playerName: string, playerColor: string, message: string, type: GameLogEntry['type']): GameLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toTimeString().slice(0, 5),
    playerName,
    playerColor,
    message,
    type,
  };
}

function pickRandomCard(room: RoomState, type: TodType, excludeId?: string): TodCard {
  const { card, nextUsedIds } = drawUniqueTodCard(room.customCards, room.usedCardIds || [], type, excludeId);
  room.usedCardIds = nextUsedIds;
  return card;
}

function broadcastRoomState(wss: WebSocketServer, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const payload = JSON.stringify({ type: 'room:state', state: room });
  wss.clients.forEach((client) => {
    const info = clientRooms.get(client);
    if (client.readyState === WebSocket.OPEN && info?.roomId === roomId) client.send(payload);
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', activeRooms: rooms.size }));

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (raw: string) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === 'room:create') {
          let roomId = generateRoomCode();
          while (rooms.has(roomId)) roomId = generateRoomCode();

          const hostPlayer: Player = {
            id: msg.playerId || `p-${Date.now()}`,
            name: (msg.playerName || 'Pemain 1').trim().slice(0, 18),
            color: PLAYER_PRESETS[0].color,
            avatar: PLAYER_PRESETS[0].avatar,
            position: 1,
            truthCount: 0,
            dareCount: 0,
            laddersClimbed: 0,
            snakesBitten: 0,
            connected: true,
          };

          const newRoom: RoomState = {
            roomId,
            mode: 'ONLINE',
            status: 'PLAYING',
            players: [hostPlayer],
            currentTurnIndex: 0,
            diceValue: 1,
            isRolling: false,
            activeTod: null,
            winner: null,
            logs: [createLog(hostPlayer.name, hostPlayer.color, `Membuat room multiplayer #${roomId}`, 'MOVE')],
            customCards: [],
          };

          rooms.set(roomId, newRoom);
          clientRooms.set(ws, { roomId, playerId: hostPlayer.id });
          ws.send(JSON.stringify({ type: 'room:joined', roomId, playerId: hostPlayer.id, state: newRoom }));
          broadcastRoomState(wss, roomId);
        }

        if (msg.type === 'room:join') {
          const roomId = (msg.roomId || '').toUpperCase().trim();
          const room = rooms.get(roomId);
          if (!room) {
            ws.send(JSON.stringify({ type: 'room:error', message: 'Kode Room tidak ditemukan. Pastikan kode 5 karakter sudah benar.' }));
            return;
          }

          const existingPlayer = room.players.find((p) => p.id === msg.playerId);
          if (existingPlayer) {
            existingPlayer.connected = true;
            clientRooms.set(ws, { roomId, playerId: existingPlayer.id });
            ws.send(JSON.stringify({ type: 'room:joined', roomId, playerId: existingPlayer.id, state: room }));
            broadcastRoomState(wss, roomId);
            return;
          }

          if (room.players.length >= 6) {
            ws.send(JSON.stringify({ type: 'room:error', message: 'Room sudah penuh (maksimal 6 pemain).' }));
            return;
          }

          const preset = PLAYER_PRESETS[room.players.length % PLAYER_PRESETS.length];
          const newPlayer: Player = {
            id: msg.playerId || `p-${Date.now()}`,
            name: (msg.playerName || `Pemain ${room.players.length + 1}`).trim().slice(0, 18),
            color: preset.color,
            avatar: preset.avatar,
            position: 1,
            truthCount: 0,
            dareCount: 0,
            laddersClimbed: 0,
            snakesBitten: 0,
            connected: true,
          };

          room.players.push(newPlayer);
          room.logs.unshift(createLog(newPlayer.name, newPlayer.color, 'Bergabung ke dalam permainan!', 'MOVE'));
          clientRooms.set(ws, { roomId, playerId: newPlayer.id });
          ws.send(JSON.stringify({ type: 'room:joined', roomId, playerId: newPlayer.id, state: room }));
          broadcastRoomState(wss, roomId);
        }

        if (msg.type === 'game:roll') {
          const info = clientRooms.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room || room.status !== 'PLAYING' || room.isRolling) return;

          const currentPlayer = room.players[room.currentTurnIndex];
          if (!currentPlayer) return;

          const roll = Math.floor(Math.random() * 6) + 1;
          room.diceValue = roll;

          let nextPos = currentPlayer.position + roll;
          if (nextPos > 100) nextPos = 100 - (nextPos - 100);

          const startPos = currentPlayer.position;
          currentPlayer.position = nextPos;
          room.logs.unshift(
            createLog(currentPlayer.name, currentPlayer.color, `Melempar dadu [${roll}] dan maju dari petak ${startPos} ke petak ${nextPos}.`, 'MOVE')
          );

          const ladder = LADDERS.find((l) => l.start === nextPos);
          const snake = SNAKES.find((s) => s.start === nextPos);

          if (ladder) {
            currentPlayer.position = ladder.end;
            currentPlayer.laddersClimbed += 1;

            if (ladder.start % 2 === 0) {
              const modes: Array<'RANDOM_TRUTH' | 'RANDOM_DARE' | 'FREE_CHOICE'> = [
                'FREE_CHOICE',
                'FREE_CHOICE',
                'RANDOM_TRUTH',
                'RANDOM_DARE',
              ];
              const assignedMode = modes[Math.floor(Math.random() * modes.length)];
              let selectedType: TodType | null = null;
              let card: TodCard | null = null;
              let phase: 'CHOICE_UNLOCKED' | 'REVEALED' = 'CHOICE_UNLOCKED';

              if (assignedMode === 'RANDOM_TRUTH') {
                selectedType = 'TRUTH';
                card = pickRandomCard(room, 'TRUTH');
                phase = 'REVEALED';
              } else if (assignedMode === 'RANDOM_DARE') {
                selectedType = 'DARE';
                card = pickRandomCard(room, 'DARE');
                phase = 'REVEALED';
              }

              room.status = 'TRUTH_OR_DARE';
              room.activeTod = {
                playerId: currentPlayer.id,
                playerName: currentPlayer.name,
                fromTile: ladder.start,
                toTile: ladder.end,
                triggerSource: 'EVEN_LADDER',
                phase,
                assignedMode,
                selectedType,
                card,
              };
              room.logs.unshift(
                createLog(currentPlayer.name, currentPlayer.color, `Mendarat di Tangga Genap (Petak ${ladder.start} → ${ladder.end})! Tantangan Truth or Dare aktif!`, 'LADDER_EVEN')
              );
            } else {
              room.logs.unshift(
                createLog(currentPlayer.name, currentPlayer.color, `Naik Tangga Ganjil dari petak ${ladder.start} langsung ke petak ${ladder.end}!`, 'LADDER_ODD')
              );
              room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
            }
          } else if (snake) {
            currentPlayer.position = snake.start;
            currentPlayer.snakesBitten += 1;
            room.status = 'TRUTH_OR_DARE';
            room.activeTod = {
              playerId: currentPlayer.id,
              playerName: currentPlayer.name,
              fromTile: snake.start,
              toTile: snake.start - 1,
              triggerSource: 'SNAKE_HEAD',
              snakeTailTile: snake.end,
              phase: 'CHOICE_UNLOCKED',
              assignedMode: 'RANDOM_DARE',
              selectedType: 'DARE',
              card: null,
            };
            room.logs.unshift(
              createLog(currentPlayer.name, currentPlayer.color, `Menginjak Kepala Ular di petak ${snake.start}! Pilih ambil DARE (turun 1 angka ke #${snake.start - 1}) atau meluncur ke ekor ular (#${snake.end})!`, 'SNAKE')
            );
          } else if (currentPlayer.position === 100) {
            room.status = 'GAME_OVER';
            room.winner = currentPlayer;
            room.logs.unshift(createLog(currentPlayer.name, currentPlayer.color, `Mencapai petak 100 dan memenangkan permainan!`, 'WIN'));
          } else {
            room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
          }

          room.logs = room.logs.slice(0, 40);
          broadcastRoomState(wss, info.roomId);
        }

        if (msg.type === 'tod:choose') {
          const info = clientRooms.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room || !room.activeTod) return;

          const chosenType: TodType = msg.todType === 'DARE' ? 'DARE' : 'TRUTH';
          room.activeTod.selectedType = chosenType;
          room.activeTod.card = pickRandomCard(room, chosenType);
          room.activeTod.phase = 'REVEALED';
          broadcastRoomState(wss, info.roomId);
        }

        if (msg.type === 'tod:reroll_card') {
          const info = clientRooms.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room || !room.activeTod || !room.activeTod.selectedType) return;

          room.activeTod.card = pickRandomCard(room, room.activeTod.selectedType);
          broadcastRoomState(wss, info.roomId);
        }

        if (msg.type === 'tod:resolve') {
          const info = clientRooms.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room || !room.activeTod) return;

          const completed = Boolean(msg.completed);
          const activeTod = room.activeTod;
          const player = room.players.find((p) => p.id === activeTod.playerId);
          const isSnakeRescue = activeTod.triggerSource === 'SNAKE_HEAD';
          const snakeTail = activeTod.snakeTailTile ?? activeTod.fromTile;

          if (player) {
            if (isSnakeRescue) {
              if (completed) {
                player.position = activeTod.toTile;
                player.dareCount += 1;
                room.logs.unshift(createLog(player.name, player.color, `Berani menyelesaikan DARE di Kepala Ular #${activeTod.fromTile}! Hanya turun 1 angka ke petak ${activeTod.toTile}.`, 'TOD_COMPLETE'));
              } else {
                player.position = snakeTail;
                room.logs.unshift(createLog(player.name, player.color, `Menolak/menyerah DARE di Kepala Ular #${activeTod.fromTile}! Meluncur turun ke ekor ular di petak ${snakeTail}.`, 'TOD_SKIP'));
              }
            } else if (completed) {
              if (activeTod.selectedType === 'TRUTH') player.truthCount += 1;
              if (activeTod.selectedType === 'DARE') player.dareCount += 1;
              room.logs.unshift(createLog(player.name, player.color, `Berhasil menyelesaikan ${activeTod.selectedType} di Tangga Genap #${activeTod.fromTile} dan bertahan di petak ${activeTod.toTile}!`, 'TOD_COMPLETE'));
            } else {
              player.position = activeTod.fromTile;
              room.logs.unshift(createLog(player.name, player.color, `Menyerah pada tantangan ${activeTod.selectedType}! Batal naik tangga dan kembali ke petak ${activeTod.fromTile}.`, 'TOD_SKIP'));
            }
          }

          room.activeTod = null;
          room.status = 'PLAYING';
          room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
          broadcastRoomState(wss, info.roomId);
        }

        if (msg.type === 'card:add_custom') {
          const info = clientRooms.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room) return;

          const newCard: TodCard = {
            id: `custom-${Date.now()}`,
            type: msg.cardType === 'DARE' ? 'DARE' : 'TRUTH',
            category: 'Seru',
            text: String(msg.text || '').trim().slice(0, 220),
            bonusText: 'Kartu Kustom Pemain — Selesaikan untuk bertahan di puncak tangga!',
          };
          if (newCard.text.length > 3) {
            room.customCards.push(newCard);
            broadcastRoomState(wss, info.roomId);
          }
        }

        if (msg.type === 'game:reset') {
          const info = clientRooms.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room) return;

          room.status = 'PLAYING';
          room.currentTurnIndex = 0;
          room.diceValue = 1;
          room.activeTod = null;
          room.winner = null;
          room.players.forEach((p) => {
            p.position = 1;
            p.truthCount = 0;
            p.dareCount = 0;
            p.laddersClimbed = 0;
            p.snakesBitten = 0;
          });
          room.logs = [createLog('Sistem', '#10B981', 'Permainan direset! Semua pemain kembali ke petak 1.', 'MOVE')];
          broadcastRoomState(wss, info.roomId);
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
