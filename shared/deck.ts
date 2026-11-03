import { Card, Rank, Suit } from './types';

// Tien Len (ទៀងឡែន): ♠ (Spades) < ♣ (Clubs) < ♦ (Diamonds) < ♥ (Hearts)
export const SUITS: Suit[] = ['S', 'C', 'D', 'H'];
export const RANKS: Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

export const RANK_VALUE_MAP: Record<Rank, number> = {
  '3': 0,
  '4': 1,
  '5': 2,
  '6': 3,
  '7': 4,
  '8': 5,
  '9': 6,
  '10': 7,
  'J': 8,
  'Q': 9,
  'K': 10,
  'A': 11,
  '2': 12,
};

export const SUIT_VALUE_MAP: Record<Suit, number> = {
  'S': 0, // Spades / ប៊ិច / បោស (Lowest)
  'C': 1, // Clubs / ជ្វា / ខ្វက်
  'D': 2, // Diamonds / ការ៉ូ / ត្បូង
  'H': 3, // Hearts / បេះដូង / ស៊ឺ (Highest)
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  'S': '♠',
  'C': '♣',
  'D': '♦',
  'H': '♥',
};

export const SUIT_NAMES: Record<Suit, string> = {
  'S': 'Spades',
  'C': 'Clubs',
  'D': 'Diamonds',
  'H': 'Hearts',
};

export const SUIT_KHMER_NAMES: Record<Suit, string> = {
  'S': 'ប៊ិច',
  'C': 'ជ្វា',
  'D': 'ការ៉ូ',
  'H': 'បេះដូង',
};

export function getCardAbsolutePower(card: Card): number {
  return RANK_VALUE_MAP[card.rank] * 4 + SUIT_VALUE_MAP[card.suit];
}

export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({
        rank,
        suit,
        id: `${rank}${suit}`,
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sortCardsByTienLen(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getCardAbsolutePower(a) - getCardAbsolutePower(b));
}

// Keep sortCardsByBigTwo as alias for backwards compatibility
export const sortCardsByBigTwo = sortCardsByTienLen;

export function sortCardsBySuit(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (a.suit !== b.suit) {
      return SUIT_VALUE_MAP[a.suit] - SUIT_VALUE_MAP[b.suit];
    }
    return RANK_VALUE_MAP[a.rank] - RANK_VALUE_MAP[b.rank];
  });
}

export interface DealResult {
  hands: [Card[], Card[], Card[], Card[]];
  firstTurnSeatIndex: number;
}

export function dealTienLenHands(): DealResult {
  const deck = shuffleDeck(createStandardDeck());
  const hands: [Card[], Card[], Card[], Card[]] = [[], [], [], []];

  for (let i = 0; i < 52; i++) {
    hands[i % 4].push(deck[i]);
  }

  let firstTurnSeatIndex = 0;
  for (let seat = 0; seat < 4; seat++) {
    hands[seat] = sortCardsByTienLen(hands[seat]);
    // In Tien Len (ទៀងឡែន), the player with 3 of Spades (3S / ៣ ប៊ិច) goes first!
    if (hands[seat].some((c) => c.rank === '3' && c.suit === 'S')) {
      firstTurnSeatIndex = seat;
    }
  }

  return {
    hands,
    firstTurnSeatIndex,
  };
}

// Keep dealBigTwoHands as alias for backwards compatibility
export const dealBigTwoHands = dealTienLenHands;
