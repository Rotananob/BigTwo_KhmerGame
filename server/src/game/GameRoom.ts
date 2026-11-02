import { Server } from 'socket.io';
import {
  Card,
  ClientToServerEvents,
  GameStatePublic,
  HandCombination,
  PlayerPublicInfo,
  RoundSummary,
  ServerToClientEvents,
  TrickPlay,
} from '../../../shared/types';
import { dealBigTwoHands, DealResult } from '../../../shared/deck';
import { calculateRoundScores } from '../../../shared/scoring';
import { chooseBotMove } from '../../../shared/ai';
import { validatePlay } from '../../../shared/rules';
import { db } from '../db/database';

export interface RoomPlayer {
  id: string;
  socketId: string | null;
  name: string;
  avatar: string;
  isBot: boolean;
  seatIndex: number;
  cards: Card[];
  isReady: boolean;
  score: number;
  hasPassed: boolean;
}

const BOT_NAMES = ['Bot Luna', 'Bot Titan', 'Bot Pixel', 'Bot Cipher'];
const BOT_AVATARS = ['🤖', '👾', '🐱', '🦊'];

export class GameRoom {
  public id: string;
  public code: string;
  public name: string;
  public hostId: string;
  public fillBots: boolean;
  public status: 'WAITING' | 'DEALING' | 'PLAYING' | 'ROUND_OVER' = 'WAITING';
  public seats: (RoomPlayer | null)[] = [null, null, null, null];
  public currentTurnSeat = 0;
  public lastPlay: TrickPlay | null = null;
  public trickPlays: TrickPlay[] = [];
  public consecutivePasses = 0;
  public roundNumber = 1;
  public isFreeLead = true;
  public isFirstTrickOfGame = true;
  public winnerSeatIndex: number | null = null;
  public scores: Record<string, number> = {};
  public roundSummary?: RoundSummary;

  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private botTimer: NodeJS.Timeout | null = null;

  constructor(
    id: string,
    code: string,
    name: string,
    hostId: string,
    fillBots: boolean,
    io: Server<ClientToServerEvents, ServerToClientEvents>
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.hostId = hostId;
    this.fillBots = fillBots;
    this.io = io;
  }

  public getPlayerCount(): number {
    return this.seats.filter((s) => s !== null).length;
  }

  public getHumanCount(): number {
    return this.seats.filter((s) => s !== null && !s.isBot).length;
  }

  public addPlayer(
    id: string,
    socketId: string,
    name: string,
    avatar = '👤'
  ): { success: boolean; message?: string } {
    if (this.status !== 'WAITING') {
      return { success: false, message: 'Game has already started in this room.' };
    }

    // Check if player is already seated
    const existingIndex = this.seats.findIndex((s) => s && s.id === id);
    if (existingIndex !== -1) {
      // Reconnect
      this.seats[existingIndex]!.socketId = socketId;
      return { success: true };
    }

    // Find first empty seat
    const emptySeat = this.seats.findIndex((s) => s === null);
    if (emptySeat === -1) {
      return { success: false, message: 'Room is already full (4 players maximum).' };
    }

    this.seats[emptySeat] = {
      id,
      socketId,
      name,
      avatar,
      isBot: false,
      seatIndex: emptySeat,
      cards: [],
      isReady: id === this.hostId, // Host is ready by default
      score: this.scores[id] || 0,
      hasPassed: false,
    };

    if (this.fillBots) {
      this.populateBots();
    }

    this.broadcastState();
    return { success: true };
  }

  public removePlayer(socketId: string): void {
    const seatIndex = this.seats.findIndex((s) => s && s.socketId === socketId);
    if (seatIndex === -1) return;

    const player = this.seats[seatIndex]!;
    if (this.status === 'WAITING') {
      this.seats[seatIndex] = null;

      // Transfer host if host left
      if (player.id === this.hostId) {
        const nextHuman = this.seats.find((s) => s && !s.isBot);
        if (nextHuman) {
          this.hostId = nextHuman.id;
        }
      }

      if (this.fillBots) {
        this.populateBots();
      }
      this.broadcastState();
    } else {
      // In-game disconnection: Convert player into bot to allow game to continue smoothly!
      player.isBot = true;
      player.socketId = null;
      player.name = `${player.name} (Bot)`;
      this.broadcastState();

      if (this.currentTurnSeat === seatIndex) {
        this.scheduleBotTurn();
      }
    }
  }

  public toggleReady(socketId: string): void {
    const player = this.seats.find((s) => s && s.socketId === socketId);
    if (!player || this.status !== 'WAITING') return;

    player.isReady = !player.isReady;
    this.broadcastState();

    // Auto-start if all 4 seats are occupied and ready
    const allFilled = this.seats.every((s) => s !== null);
    const allReady = this.seats.every((s) => s !== null && (s.isReady || s.isBot));
    if (allFilled && allReady) {
      this.startRound();
    }
  }

  public setBotFill(fill: boolean): void {
    if (this.status !== 'WAITING') return;
    this.fillBots = fill;

    if (fill) {
      this.populateBots();
    } else {
      // Remove all bots
      for (let i = 0; i < 4; i++) {
        if (this.seats[i] && this.seats[i]!.isBot) {
          this.seats[i] = null;
        }
      }
    }
    this.broadcastState();
  }

  private populateBots(): void {
    let botIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (this.seats[i] === null) {
        const botId = `bot-${i}-${Date.now()}`;
        this.seats[i] = {
          id: botId,
          socketId: null,
          name: BOT_NAMES[botIndex % BOT_NAMES.length],
          avatar: BOT_AVATARS[botIndex % BOT_AVATARS.length],
          isBot: true,
          seatIndex: i,
          cards: [],
          isReady: true,
          score: this.scores[botId] || 0,
          hasPassed: false,
        };
        botIndex++;
      }
    }
  }

  public startRound(): void {
    // Populate bots if needed to ensure 4 players
    if (this.seats.some((s) => s === null)) {
      this.populateBots();
    }

    const deal: DealResult = dealBigTwoHands();

    for (let i = 0; i < 4; i++) {
      if (this.seats[i]) {
        this.seats[i]!.cards = deal.hands[i];
        this.seats[i]!.hasPassed = false;
      }
    }

    this.status = 'PLAYING';
    this.currentTurnSeat = deal.firstTurnSeatIndex;
    this.lastPlay = null;
    this.trickPlays = [];
    this.consecutivePasses = 0;
    this.isFreeLead = true;
    this.isFirstTrickOfGame = true;
    this.winnerSeatIndex = null;
    this.roundSummary = undefined;

    this.broadcastState();
    this.sendIndividualHands();

    // Check if first player is bot
    const firstPlayer = this.seats[this.currentTurnSeat];
    if (firstPlayer && firstPlayer.isBot) {
      this.scheduleBotTurn();
    }
  }

  public playCards(socketId: string, cardIds: string[]): { success: boolean; error?: string } {
    if (this.status !== 'PLAYING') return { success: false, error: 'Game is not currently playing.' };

    const player = this.seats[this.currentTurnSeat];
    if (!player || player.socketId !== socketId) {
      return { success: false, error: 'It is not your turn.' };
    }

    return this.executePlay(player, cardIds);
  }

  public passTurn(socketId: string): { success: boolean; error?: string } {
    if (this.status !== 'PLAYING') return { success: false, error: 'Game is not currently playing.' };

    const player = this.seats[this.currentTurnSeat];
    if (!player || player.socketId !== socketId) {
      return { success: false, error: 'It is not your turn.' };
    }

    return this.executePass(player);
  }

  private executePlay(player: RoomPlayer, cardIds: string[]): { success: boolean; error?: string } {
    // Verify cards are in player hand
    const selectedCards: Card[] = [];
    for (const id of cardIds) {
      const found = player.cards.find((c) => c.id === id);
      if (!found) {
        return { success: false, error: `You do not hold card ${id}.` };
      }
      selectedCards.push(found);
    }

    const lastComb = this.lastPlay ? this.lastPlay.combination : null;
    const validation = validatePlay(selectedCards, lastComb, this.isFreeLead, this.isFirstTrickOfGame);

    if (!validation.isValid || !validation.combination) {
      return { success: false, error: validation.errorMessage || 'Invalid move.' };
    }

    // Move is valid! Remove cards from player hand
    const playedSet = new Set(cardIds);
    player.cards = player.cards.filter((c) => !playedSet.has(c.id));
    player.hasPassed = false;

    const playRecord: TrickPlay = {
      playerId: player.id,
      playerName: player.name,
      seatIndex: player.seatIndex,
      combination: validation.combination,
      timestamp: Date.now(),
    };

    this.lastPlay = playRecord;
    this.trickPlays.push(playRecord);
    this.consecutivePasses = 0;
    this.isFreeLead = false;
    this.isFirstTrickOfGame = false;

    // Reset passed states on table
    for (const seat of this.seats) {
      if (seat) seat.hasPassed = false;
    }

    this.io.to(this.code).emit('card_played', playRecord);

    // Check Win Condition
    if (player.cards.length === 0) {
      this.handleRoundWin(player);
      return { success: true };
    }

    // Advance to next turn
    this.advanceTurn();
    return { success: true };
  }

  private executePass(player: RoomPlayer): { success: boolean; error?: string } {
    if (this.isFreeLead || !this.lastPlay) {
      return { success: false, error: 'You have free lead and cannot pass. You must lead a combination.' };
    }

    if (this.isFirstTrickOfGame) {
      return { success: false, error: 'Cannot pass on the very first trick of the game.' };
    }

    player.hasPassed = true;
    this.consecutivePasses += 1;

    this.io.to(this.code).emit('player_passed', {
      playerId: player.id,
      seatIndex: player.seatIndex,
    });

    // 3 passes in a row = trick ends!
    if (this.consecutivePasses >= 3) {
      const trickWinnerSeat = this.lastPlay.seatIndex;
      const winnerName = this.lastPlay.playerName;

      this.io.to(this.code).emit('trick_cleared', {
        winnerSeatIndex: trickWinnerSeat,
        message: `${winnerName} won the trick! Table cleared.`,
      });

      // Clear table
      this.lastPlay = null;
      this.trickPlays = [];
      this.consecutivePasses = 0;
      this.isFreeLead = true;
      this.currentTurnSeat = trickWinnerSeat;

      for (const seat of this.seats) {
        if (seat) seat.hasPassed = false;
      }

      this.broadcastState();

      // Check if winner is bot
      const winnerPlayer = this.seats[trickWinnerSeat];
      if (winnerPlayer && winnerPlayer.isBot) {
        this.scheduleBotTurn();
      }
      return { success: true };
    }

    this.advanceTurn();
    return { success: true };
  }

  private advanceTurn(): void {
    this.currentTurnSeat = (this.currentTurnSeat + 1) % 4;
    this.broadcastState();
    this.sendIndividualHands();

    const nextPlayer = this.seats[this.currentTurnSeat];
    if (nextPlayer && nextPlayer.isBot) {
      this.scheduleBotTurn();
    }
  }

  private scheduleBotTurn(): void {
    if (this.botTimer) clearTimeout(this.botTimer);

    // Natural bot delay: 1000ms - 1400ms for realistic pacing
    this.botTimer = setTimeout(() => {
      const bot = this.seats[this.currentTurnSeat];
      if (!bot || !bot.isBot || this.status !== 'PLAYING') return;

      const otherCounts = this.seats
        .filter((s) => s && s.id !== bot.id)
        .map((s) => s!.cards.length);

      const lastComb = this.lastPlay ? this.lastPlay.combination : null;
      const move = chooseBotMove(
        bot.cards,
        lastComb,
        this.isFreeLead,
        this.isFirstTrickOfGame,
        otherCounts
      );

      if (move) {
        const cardIds = move.cards.map((c) => c.id);
        this.executePlay(bot, cardIds);
      } else {
        this.executePass(bot);
      }
    }, 1100);
  }

  private handleRoundWin(winner: RoomPlayer): void {
    this.status = 'ROUND_OVER';
    this.winnerSeatIndex = winner.seatIndex;

    const endData = this.seats
      .filter((s): s is RoomPlayer => s !== null)
      .map((s) => ({
        playerId: s.id,
        playerName: s.name,
        seatIndex: s.seatIndex,
        remainingCards: s.cards,
      }));

    const summary = calculateRoundScores(winner.id, endData, this.scores);
    this.roundSummary = summary;

    // Update cumulative scores
    for (const delta of summary.seatDeltas) {
      this.scores[delta.playerId] = delta.totalPoints;
      const seat = this.seats.find((s) => s && s.id === delta.playerId);
      if (seat) seat.score = delta.totalPoints;
    }

    // Persist to database
    db.recordMatchResult(
      {
        id: `match-${Date.now()}`,
        roomCode: this.code,
        winnerId: winner.id,
        winnerName: winner.name,
        playersJson: JSON.stringify(summary.seatDeltas),
        finishedAt: new Date().toISOString(),
      },
      summary.seatDeltas.map((s) => ({
        userId: s.playerId,
        won: s.playerId === winner.id,
        points: s.pointsDelta,
      }))
    );

    this.roundNumber += 1;
    this.broadcastState();
    this.sendIndividualHands();
    this.io.to(this.code).emit('game_over', summary);
  }

  public requestRematch(): void {
    if (this.status !== 'ROUND_OVER') return;
    this.startRound();
  }

  public broadcastState(): void {
    const publicState: GameStatePublic = {
      roomId: this.id,
      roomCode: this.code,
      roomName: this.name,
      status: this.status,
      currentTurnSeat: this.currentTurnSeat,
      lastPlay: this.lastPlay,
      trickPlays: this.trickPlays,
      consecutivePasses: this.consecutivePasses,
      roundNumber: this.roundNumber,
      isFreeLead: this.isFreeLead,
      isFirstTrickOfGame: this.isFirstTrickOfGame,
      winnerSeatIndex: this.winnerSeatIndex,
      players: this.seats.map((s) =>
        s
          ? {
              id: s.id,
              name: s.name,
              avatar: s.avatar,
              isBot: s.isBot,
              seatIndex: s.seatIndex,
              cardCount: s.cards.length,
              isReady: s.isReady,
              score: s.score,
              hasPassed: s.hasPassed,
            }
          : null
      ),
      scores: this.scores,
      roundSummary: this.roundSummary,
    };

    this.io.to(this.code).emit('room_state', publicState);
  }

  public sendIndividualHands(): void {
    for (const seat of this.seats) {
      if (seat && seat.socketId) {
        this.io.to(seat.socketId).emit('your_hand', seat.cards);
      }
    }
  }
}
