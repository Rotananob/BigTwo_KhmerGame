import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  username: string;
  passwordHash?: string;
  avatar: string;
  isGuest: boolean;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  createdAt: string;
}

export interface RoomRecord {
  id: string;
  code: string;
  name: string;
  hostId: string;
  status: string;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  roomCode: string;
  winnerId: string;
  winnerName: string;
  playersJson: string;
  finishedAt: string;
}

export interface DatabaseSchema {
  users: Record<string, UserRecord>;
  rooms: Record<string, RoomRecord>;
  matches: MatchRecord[];
}

export class AppDatabase {
  private dataDir: string;
  private dbPath: string;
  private schema: DatabaseSchema;

  constructor() {
    this.dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.dbPath = path.join(this.dataDir, 'bigtwo_data.json');
    this.schema = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, initializing fresh:', err);
      }
    }
    const initial: DatabaseSchema = {
      users: {},
      rooms: {},
      matches: [],
    };
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema): void {
    const tmp = `${this.dbPath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, this.dbPath);
  }

  public getUserById(id: string): UserRecord | null {
    return this.schema.users[id] || null;
  }

  public getUserByUsername(username: string): UserRecord | null {
    const lower = username.toLowerCase();
    for (const u of Object.values(this.schema.users)) {
      if (u.username.toLowerCase() === lower) {
        return u;
      }
    }
    return null;
  }

  public saveUser(user: UserRecord): void {
    this.schema.users[user.id] = user;
    this.save(this.schema);
  }

  public recordMatchResult(match: MatchRecord, scoreDeltas: { userId: string; won: boolean; points: number }[]): void {
    this.schema.matches.push(match);

    for (const delta of scoreDeltas) {
      const user = this.schema.users[delta.userId];
      if (user) {
        user.gamesPlayed += 1;
        if (delta.won) user.gamesWon += 1;
        user.totalScore += delta.points;
      }
    }

    this.save(this.schema);
  }

  public getLeaderboard(limit = 10): UserRecord[] {
    return Object.values(this.schema.users)
      .filter((u) => !u.isGuest || u.gamesPlayed > 0)
      .sort((a, b) => b.totalScore - a.totalScore || b.gamesWon - a.gamesWon)
      .slice(0, limit);
  }
}

export const db = new AppDatabase();
