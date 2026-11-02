import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';
import { GameRoom } from './GameRoom';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map(); // Keyed by roomCode
  private socketToRoom: Map<string, string> = new Map(); // socketId -> roomCode
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public createRoom(
    hostId: string,
    hostSocketId: string,
    playerName: string,
    roomName: string,
    fillBots = true,
    avatar = '👤'
  ): { room: GameRoom; error?: string } {
    let code = this.generateCode();
    while (this.rooms.has(code)) {
      code = this.generateCode();
    }

    const roomId = `room-${Date.now()}-${code}`;
    const room = new GameRoom(roomId, code, roomName || `Room ${code}`, hostId, fillBots, this.io);
    const result = room.addPlayer(hostId, hostSocketId, playerName, avatar);

    if (!result.success) {
      return { room, error: result.message };
    }

    this.rooms.set(code, room);
    this.socketToRoom.set(hostSocketId, code);
    return { room };
  }

  public joinRoom(
    roomCode: string,
    playerId: string,
    socketId: string,
    playerName: string,
    avatar = '👤'
  ): { room?: GameRoom; error?: string } {
    const upperCode = roomCode.trim().toUpperCase();
    const room = this.rooms.get(upperCode);

    if (!room) {
      return { error: `Room ${upperCode} does not exist.` };
    }

    const result = room.addPlayer(playerId, socketId, playerName, avatar);
    if (!result.success) {
      return { error: result.message };
    }

    this.socketToRoom.set(socketId, upperCode);
    return { room };
  }

  public getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode.trim().toUpperCase());
  }

  public getRoomBySocket(socketId: string): GameRoom | undefined {
    const code = this.socketToRoom.get(socketId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  public handleDisconnect(socketId: string): void {
    const code = this.socketToRoom.get(socketId);
    if (!code) return;

    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(code);
    if (room) {
      room.removePlayer(socketId);
      // If room is completely empty (no humans left), clean it up
      if (room.getHumanCount() === 0 && room.status === 'WAITING') {
        this.rooms.delete(code);
      }
    }
  }

  public listPublicRooms(): { code: string; name: string; players: number; status: string; fillBots: boolean }[] {
    const list = [];
    for (const room of this.rooms.values()) {
      list.push({
        code: room.code,
        name: room.name,
        players: room.getPlayerCount(),
        status: room.status,
        fillBots: room.fillBots,
      });
    }
    return list;
  }
}
