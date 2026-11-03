export type Suit = 'S' | 'C' | 'D' | 'H'; // Tien Len (ទៀងឡែន): Spades (♠) < Clubs (♣) < Diamonds (♦) < Hearts (♥)
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // e.g. "3S", "10H", "2H"
}

export type CombinationType =
  | 'SINGLE'                   // សន្លឹកទោល (1 card)
  | 'PAIR'                     // គូ (2 cards)
  | 'TRIPLE'                   // បីសន្លឹក (3 cards)
  | 'STRAIGHT'                 // តង / សង់ហ្សង់ (3 to 12 consecutive cards, no 2 allowed)
  | 'FOUR_OF_A_KIND'           // ចតុរង្គ / ការ៉េ (4 cards - can cut a single 2 or pair of 2s)
  | 'THREE_CONSECUTIVE_PAIRS'  // ៣ គូជាប់គ្នា / ស៊ុីនគូ (6 cards - can cut a single 2)
  | 'FOUR_CONSECUTIVE_PAIRS';  // ៤ គូជាប់គ្នា (8 cards - can cut single 2, pair 2, four of a kind)

export interface HandCombination {
  type: CombinationType;
  cards: Card[];
  cardCount: number;
  mainRankValue: number; // Primary rank comparison value (0..12)
  mainSuitValue: number; // Primary suit comparison value (0..3: S=0, C=1, D=2, H=3)
  description: string;   // Human-readable title
}

export interface PlayerPublicInfo {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  seatIndex: number; // 0..3
  cardCount: number;
  isReady: boolean;
  score: number;
  hasPassed: boolean;
}

export interface TrickPlay {
  playerId: string;
  playerName: string;
  seatIndex: number;
  combination: HandCombination;
  timestamp: number;
}

export type GameStatus = 'WAITING' | 'DEALING' | 'PLAYING' | 'ROUND_OVER';

export interface GameStatePublic {
  roomId: string;
  roomCode: string;
  roomName: string;
  status: GameStatus;
  currentTurnSeat: number; // 0..3
  lastPlay: TrickPlay | null;
  trickPlays: TrickPlay[];
  consecutivePasses: number;
  roundNumber: number;
  isFreeLead: boolean;
  isFirstTrickOfGame: boolean;
  winnerSeatIndex: number | null;
  turnDeadline: number | null;
  players: (PlayerPublicInfo | null)[];
  scores: Record<string, number>;
  roundSummary?: RoundSummary;
}

export interface RoundSummary {
  winnerId: string;
  winnerName: string;
  seatDeltas: {
    playerId: string;
    playerName: string;
    seatIndex: number;
    remainingCards: Card[];
    remainingCount: number;
    penaltyMultiplier: number;
    pointsDelta: number;
    totalPoints: number;
  }[];
}

// Client <-> Server Socket Events
export interface ServerToClientEvents {
  room_state: (state: GameStatePublic) => void;
  your_hand: (cards: Card[]) => void;
  play_error: (message: string) => void;
  card_played: (play: TrickPlay) => void;
  player_passed: (data: { playerId: string; seatIndex: number }) => void;
  trick_cleared: (data: { winnerSeatIndex: number; message: string }) => void;
  game_over: (summary: RoundSummary) => void;
  chat_message: (msg: { sender: string; text: string; timestamp: number }) => void;
}

export interface ClientToServerEvents {
  join_room: (data: { roomCode: string; playerName: string; avatar?: string }) => void;
  create_room: (data: { roomName: string; playerName: string; avatar?: string; fillBots?: boolean }) => void;
  toggle_ready: () => void;
  toggle_bot_fill: (fill: boolean) => void;
  start_game: () => void;
  play_cards: (cardIds: string[]) => void;
  pass_turn: () => void;
  send_chat: (text: string) => void;
  request_rematch: () => void;
}
