import Peer, { DataConnection } from 'peerjs';
import { RoomState } from '../types/game';
import { applyRoomAction, generateRoomCode } from './roomStateMachine';

const PEER_PREFIX = 'ulartangga-pro-v2-';
const STORAGE_PREFIX = 'ulartangga_room_v2_';
const CHANNEL_NAME = 'ulartangga_pro_channel_v2';

/**
 * Triple-Engine Room Synchronizer (<300 lines):
 * 1. Instant LocalStorage + BroadcastChannel (same browser / multiple tabs)
 * 2. PeerJS WebRTC P2P DataChannel (cross-device / cross-URL / mobile <-> desktop)
 * 3. Express HTTP API `/api/room` (when running on same backend instance)
 */
export class OnlineRoomClient {
  private peer: Peer | null = null;
  private hostConn: DataConnection | null = null;
  private guestConns: DataConnection[] = [];
  private isHost: boolean = false;
  private currentRoom: RoomState | null = null;
  private channel: BroadcastChannel | null = null;
  private onStateChange: (room: RoomState) => void;

  constructor(onStateChange: (room: RoomState) => void) {
    this.onStateChange = onStateChange;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (ev) => {
        const data = ev.data;
        if (!data || !this.currentRoom) return;
        if (data.type === 'STATE_UPDATE' && data.room?.roomId === this.currentRoom.roomId) {
          this.currentRoom = data.room;
          this.onStateChange(data.room);
        } else if (this.isHost && data.type === 'ROOM_ACTION' && data.roomId === this.currentRoom.roomId) {
          this.processActionAsHost(data.action);
        }
      };
    }
  }

  private saveAndBroadcastState(room: RoomState) {
    this.currentRoom = room;
    try {
      localStorage.setItem(STORAGE_PREFIX + room.roomId, JSON.stringify(room));
    } catch {}
    this.channel?.postMessage({ type: 'STATE_UPDATE', room });
    this.guestConns.forEach((conn) => {
      if (conn.open) conn.send({ type: 'STATE_UPDATE', room });
    });
    this.onStateChange(room);

    fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'room:sync', roomId: room.roomId, state: room }),
    }).catch(() => {});
  }

  private processActionAsHost(action: Record<string, any>) {
    if (!this.currentRoom) return;
    const res = applyRoomAction(this.currentRoom, action);
    if (res.ok && res.room) {
      this.saveAndBroadcastState(res.room);
    }
  }

  public async createRoom(playerId: string, playerName: string): Promise<RoomState> {
    this.cleanupPeer();
    const roomId = generateRoomCode();
    const res = applyRoomAction(null, { type: 'room:create', roomId, playerId, playerName });
    const room = res.room!;
    this.isHost = true;
    this.saveAndBroadcastState(room);

    try {
      const peer = new Peer(PEER_PREFIX + roomId);
      this.peer = peer;
      peer.on('connection', (conn) => {
        this.guestConns.push(conn);
        conn.on('data', (raw: any) => {
          if (raw && raw.type === 'ROOM_ACTION') {
            this.processActionAsHost(raw.action);
          }
        });
        conn.on('open', () => {
          if (this.currentRoom) conn.send({ type: 'STATE_UPDATE', room: this.currentRoom });
        });
      });
    } catch {}

    return room;
  }

  public async joinRoom(
    roomIdInput: string,
    playerId: string,
    playerName: string
  ): Promise<{ ok: boolean; room?: RoomState; message?: string }> {
    const roomId = roomIdInput.toUpperCase().trim();
    this.cleanupPeer();
    this.isHost = false;

    // 1. Check LocalStorage (same browser tab/window)
    try {
      const cached = localStorage.getItem(STORAGE_PREFIX + roomId);
      if (cached) {
        const parsed = JSON.parse(cached) as RoomState;
        const joined = applyRoomAction(parsed, { type: 'room:join', roomId, playerId, playerName });
        if (joined.ok && joined.room) {
          this.saveAndBroadcastState(joined.room);
          return { ok: true, room: joined.room };
        }
      }
    } catch {}

    // 2. Check Express Backend `/api/room`
    try {
      const apiRes = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'room:join', roomId, playerId, playerName }),
      });
      const contentType = apiRes.headers.get('content-type') || '';
      if (apiRes.ok && contentType.includes('application/json')) {
        const data = await apiRes.json();
        if (data.ok && data.state) {
          this.currentRoom = data.state;
          this.onStateChange(data.state);
          return { ok: true, room: data.state };
        }
      }
    } catch {}

    // 3. Connect Cross-Device via PeerJS WebRTC P2P
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result: { ok: boolean; room?: RoomState; message?: string }) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      const timeout = setTimeout(() => {
        finish({
          ok: false,
          message: `Room #${roomId} tidak ditemukan atau host sedang offline. Pastikan kode 5 digit benar.`,
        });
      }, 6500);

      try {
        const peer = new Peer();
        this.peer = peer;

        peer.on('open', () => {
          const conn = peer.connect(PEER_PREFIX + roomId, { reliable: true });
          this.hostConn = conn;

          conn.on('open', () => {
            conn.send({
              type: 'ROOM_ACTION',
              action: { type: 'room:join', roomId, playerId, playerName },
            });
          });

          conn.on('data', (data: any) => {
            if (data && data.type === 'STATE_UPDATE' && data.room) {
              clearTimeout(timeout);
              this.currentRoom = data.room;
              this.onStateChange(data.room);
              finish({ ok: true, room: data.room });
            }
          });

          conn.on('error', () => {
            clearTimeout(timeout);
            finish({ ok: false, message: `Gagal terhubung ke Room #${roomId}.` });
          });
        });

        peer.on('error', () => {
          clearTimeout(timeout);
          finish({
            ok: false,
            message: `Room #${roomId} tidak ditemukan. Pastikan kode 5 karakter sudah benar.`,
          });
        });
      } catch {
        clearTimeout(timeout);
        finish({ ok: false, message: 'Gagal menginisialisasi koneksi P2P.' });
      }
    });
  }

  public sendAction(action: Record<string, any>) {
    if (!this.currentRoom) return;
    const roomId = this.currentRoom.roomId;

    if (this.isHost) {
      this.processActionAsHost(action);
      return;
    }

    const optimistic = applyRoomAction(this.currentRoom, action);
    if (optimistic.ok && optimistic.room) {
      this.currentRoom = optimistic.room;
      try {
        localStorage.setItem(STORAGE_PREFIX + roomId, JSON.stringify(optimistic.room));
      } catch {}
      this.onStateChange(optimistic.room);
    }

    this.channel?.postMessage({ type: 'ROOM_ACTION', roomId, action });
    if (this.hostConn && this.hostConn.open) {
      this.hostConn.send({ type: 'ROOM_ACTION', action });
    }

    fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...action, roomId }),
    })
      .then(async (r) => {
        if (r.ok && (r.headers.get('content-type') || '').includes('application/json')) {
          const d = await r.json();
          if (d.ok && d.state) {
            this.currentRoom = d.state;
            this.onStateChange(d.state);
          }
        }
      })
      .catch(() => {});
  }

  public pollSync() {
    if (!this.currentRoom) return;
    const roomId = this.currentRoom.roomId;

    try {
      const cached = localStorage.getItem(STORAGE_PREFIX + roomId);
      if (cached) {
        const parsed = JSON.parse(cached) as RoomState;
        if (JSON.stringify(parsed) !== JSON.stringify(this.currentRoom)) {
          this.currentRoom = parsed;
          this.onStateChange(parsed);
        }
      }
    } catch {}

    fetch(`/api/room/${roomId}`)
      .then(async (r) => {
        if (r.ok && (r.headers.get('content-type') || '').includes('application/json')) {
          const d = await r.json();
          if (d.ok && d.state && d.state.players.length >= (this.currentRoom?.players.length || 0)) {
            this.currentRoom = d.state;
            this.onStateChange(d.state);
          }
        }
      })
      .catch(() => {});
  }

  private cleanupPeer() {
    try {
      this.hostConn?.close();
      this.guestConns.forEach((c) => c.close());
      this.peer?.destroy();
    } catch {}
    this.hostConn = null;
    this.guestConns = [];
    this.peer = null;
  }

  public destroy() {
    this.cleanupPeer();
    this.channel?.close();
  }
}
