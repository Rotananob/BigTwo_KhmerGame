"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUIT_NAMES = exports.SUIT_SYMBOLS = exports.SUIT_VALUE_MAP = exports.RANK_VALUE_MAP = exports.RANKS = exports.SUITS = void 0;
exports.getCardAbsolutePower = getCardAbsolutePower;
exports.createStandardDeck = createStandardDeck;
exports.shuffleDeck = shuffleDeck;
exports.sortCardsByBigTwo = sortCardsByBigTwo;
exports.sortCardsBySuit = sortCardsBySuit;
exports.dealBigTwoHands = dealBigTwoHands;
exports.SUITS = ['D', 'C', 'H', 'S']; // Diamonds < Clubs < Hearts < Spades
exports.RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
exports.RANK_VALUE_MAP = {
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
exports.SUIT_VALUE_MAP = {
    'D': 0, // Diamonds (Lowest)
    'C': 1, // Clubs
    'H': 2, // Hearts
    'S': 3, // Spades (Highest)
};
exports.SUIT_SYMBOLS = {
    'D': '♦',
    'C': '♣',
    'H': '♥',
    'S': '♠',
};
exports.SUIT_NAMES = {
    'D': 'Diamonds',
    'C': 'Clubs',
    'H': 'Hearts',
    'S': 'Spades',
};
function getCardAbsolutePower(card) {
    return exports.RANK_VALUE_MAP[card.rank] * 4 + exports.SUIT_VALUE_MAP[card.suit];
}
function createStandardDeck() {
    const deck = [];
    for (const rank of exports.RANKS) {
        for (const suit of exports.SUITS) {
            deck.push({
                rank,
                suit,
                id: `${rank}${suit}`,
            });
        }
    }
    return deck;
}
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function sortCardsByBigTwo(cards) {
    return [...cards].sort((a, b) => getCardAbsolutePower(a) - getCardAbsolutePower(b));
}
function sortCardsBySuit(cards) {
    return [...cards].sort((a, b) => {
        if (a.suit !== b.suit) {
            return exports.SUIT_VALUE_MAP[a.suit] - exports.SUIT_VALUE_MAP[b.suit];
        }
        return exports.RANK_VALUE_MAP[a.rank] - exports.RANK_VALUE_MAP[b.rank];
    });
}
function dealBigTwoHands() {
    const deck = shuffleDeck(createStandardDeck());
    const hands = [[], [], [], []];
    for (let i = 0; i < 52; i++) {
        hands[i % 4].push(deck[i]);
    }
    let firstTurnSeatIndex = 0;
    for (let seat = 0; seat < 4; seat++) {
        hands[seat] = sortCardsByBigTwo(hands[seat]);
        if (hands[seat].some((c) => c.rank === '3' && c.suit === 'D')) {
            firstTurnSeatIndex = seat;
        }
    }
    return {
        hands,
        firstTurnSeatIndex,
    };
}
