import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

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
  private pgPool: Pool | null = null;
  private isPostgresConnected = false;

  constructor() {
    this.dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.dbPath = path.join(this.dataDir, 'bigtwo_data.json');
    this.schema = this.loadLocal();

    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && databaseUrl.trim().length > 0) {
      this.initPostgres(databaseUrl.trim());
    } else {
      console.log('[Database] Running in local JSON storage mode (server/data/bigtwo_data.json)');
    }
  }

  private async initPostgres(connectionString: string): Promise<void> {
    try {
      console.log('[Database] Connecting to Neon Postgres database...');
      this.pgPool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
      });

      // Initialize schema tables idempotently
      const client = await this.pgPool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            username VARCHAR(64) UNIQUE NOT NULL,
            password_hash TEXT,
            avatar TEXT NOT NULL,
            is_guest BOOLEAN NOT NULL DEFAULT true,
            games_played INTEGER NOT NULL DEFAULT 0,
            games_won INTEGER NOT NULL DEFAULT 0,
            total_score INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS rooms (
            id VARCHAR(64) PRIMARY KEY,
            code VARCHAR(16) UNIQUE NOT NULL,
            name VARCHAR(128) NOT NULL,
            host_id VARCHAR(64) NOT NULL,
            status VARCHAR(32) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS matches (
            id VARCHAR(64) PRIMARY KEY,
            room_code VARCHAR(16) NOT NULL,
            winner_id VARCHAR(64) NOT NULL,
            winner_name VARCHAR(64) NOT NULL,
            players_json TEXT NOT NULL,
            finished_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `);

        // Load existing users into memory cache
        const res = await client.query('SELECT * FROM users');
        for (const row of res.rows) {
          const user: UserRecord = {
            id: row.id,
            username: row.username,
            passwordHash: row.password_hash || undefined,
            avatar: row.avatar,
            isGuest: row.is_guest,
            gamesPlayed: row.games_played,
            gamesWon: row.games_won,
            totalScore: row.total_score,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          };
          this.schema.users[user.id] = user;
        }

        this.isPostgresConnected = true;
        console.log(`[Database] Neon Postgres connected successfully. Synchronized ${res.rowCount} users.`);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('[Database] Failed to initialize Neon Postgres, falling back to local file storage:', err);
      this.isPostgresConnected = false;
    }
  }

  private loadLocal(): DatabaseSchema {
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
    this.saveLocal(initial);
    return initial;
  }

  private saveLocal(data: DatabaseSchema): void {
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
    this.saveLocal(this.schema);

    // Asynchronously upsert to Neon Postgres if connected
    if (this.pgPool && this.isPostgresConnected) {
      this.pgPool
        .query(
          `INSERT INTO users (id, username, password_hash, avatar, is_guest, games_played, games_won, total_score, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             username = EXCLUDED.username,
             password_hash = EXCLUDED.password_hash,
             avatar = EXCLUDED.avatar,
             is_guest = EXCLUDED.is_guest,
             games_played = EXCLUDED.games_played,
             games_won = EXCLUDED.games_won,
             total_score = EXCLUDED.total_score`,
          [
            user.id,
            user.username,
            user.passwordHash || null,
            user.avatar,
            user.isGuest,
            user.gamesPlayed,
            user.gamesWon,
            user.totalScore,
            user.createdAt,
          ]
        )
        .catch((err) => console.error('[Database] Failed to upsert user in Postgres:', err));
    }
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

    this.saveLocal(this.schema);

    if (this.pgPool && this.isPostgresConnected) {
      // Record match
      this.pgPool
        .query(
          `INSERT INTO matches (id, room_code, winner_id, winner_name, players_json, finished_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            match.id,
            match.roomCode,
            match.winnerId,
            match.winnerName,
            match.playersJson,
            match.finishedAt,
          ]
        )
        .catch((err) => console.error('[Database] Failed to insert match in Postgres:', err));

      // Update user stats in Postgres
      for (const delta of scoreDeltas) {
        const user = this.schema.users[delta.userId];
        if (user) {
          this.pgPool
            .query(
              `UPDATE users SET games_played = $1, games_won = $2, total_score = $3 WHERE id = $4`,
              [user.gamesPlayed, user.gamesWon, user.totalScore, user.id]
            )
            .catch((err) => console.error('[Database] Failed to update user stats in Postgres:', err));
        }
      }
    }
  }

  public getLeaderboard(limit = 10): UserRecord[] {
    return Object.values(this.schema.users)
      .filter((u) => !u.isGuest || u.gamesPlayed > 0)
      .sort((a, b) => b.totalScore - a.totalScore || b.gamesWon - a.gamesWon)
      .slice(0, limit);
  }
}

export const db = new AppDatabase();
