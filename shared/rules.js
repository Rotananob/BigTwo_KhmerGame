"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRAIGHT_DEFINITIONS = exports.FIVE_CARD_CATEGORY_POWER = void 0;
exports.analyzeCombination = analyzeCombination;
exports.beats = beats;
exports.validatePlay = validatePlay;
const deck_1 = require("./deck");
// 5-Card Hand Category Power
exports.FIVE_CARD_CATEGORY_POWER = {
    'SINGLE': 0,
    'PAIR': 0,
    'TRIPLE': 0,
    'STRAIGHT': 1,
    'FLUSH': 2,
    'FULL_HOUSE': 3,
    'FOUR_OF_A_KIND': 4,
    'STRAIGHT_FLUSH': 5,
};
// Defined standard straight rank sequences
// Ordered from lowest straight to highest straight
exports.STRAIGHT_DEFINITIONS = [
    { ranks: ['3', '4', '5', '6', '7'], straightIndex: 0, topRank: '7' },
    { ranks: ['4', '5', '6', '7', '8'], straightIndex: 1, topRank: '8' },
    { ranks: ['5', '6', '7', '8', '9'], straightIndex: 2, topRank: '9' },
    { ranks: ['6', '7', '8', '9', '10'], straightIndex: 3, topRank: '10' },
    { ranks: ['7', '8', '9', '10', 'J'], straightIndex: 4, topRank: 'J' },
    { ranks: ['8', '9', '10', 'J', 'Q'], straightIndex: 5, topRank: 'Q' },
    { ranks: ['9', '10', 'J', 'Q', 'K'], straightIndex: 6, topRank: 'K' },
    { ranks: ['10', 'J', 'Q', 'K', 'A'], straightIndex: 7, topRank: 'A' },
    { ranks: ['A', '2', '3', '4', '5'], straightIndex: 8, topRank: '5' },
    { ranks: ['2', '3', '4', '5', '6'], straightIndex: 9, topRank: '6' },
    { ranks: ['J', 'Q', 'K', 'A', '2'], straightIndex: 10, topRank: '2' },
];
/**
 * Analyzes an arbitrary set of cards to determine if they form a legal Big Two combination.
 * Returns HandCombination if valid, or null if invalid.
 */
function analyzeCombination(cards) {
    if (!cards || cards.length === 0)
        return null;
    const count = cards.length;
    const sorted = (0, deck_1.sortCardsByBigTwo)(cards);
    // 1. Single Card
    if (count === 1) {
        const card = sorted[0];
        return {
            type: 'SINGLE',
            cards: sorted,
            mainRankValue: deck_1.RANK_VALUE_MAP[card.rank],
            mainSuitValue: deck_1.SUIT_VALUE_MAP[card.suit],
            description: `${card.rank}${deck_1.SUIT_SYMBOLS[card.suit]} (${card.rank} of ${deck_1.SUIT_NAMES[card.suit]})`,
        };
    }
    // 2. Pair
    if (count === 2) {
        if (sorted[0].rank === sorted[1].rank) {
            const rank = sorted[0].rank;
            const highestSuitCard = sorted[1]; // sorted ascending, so index 1 has higher suit
            return {
                type: 'PAIR',
                cards: sorted,
                mainRankValue: deck_1.RANK_VALUE_MAP[rank],
                mainSuitValue: deck_1.SUIT_VALUE_MAP[highestSuitCard.suit],
                description: `Pair of ${rank}s (${deck_1.SUIT_SYMBOLS[sorted[0].suit]}${deck_1.SUIT_SYMBOLS[sorted[1].suit]})`,
            };
        }
        return null;
    }
    // 3. Triple (Three of a Kind)
    if (count === 3) {
        if (sorted[0].rank === sorted[1].rank && sorted[1].rank === sorted[2].rank) {
            const rank = sorted[0].rank;
            const highestSuitCard = sorted[2];
            return {
                type: 'TRIPLE',
                cards: sorted,
                mainRankValue: deck_1.RANK_VALUE_MAP[rank],
                mainSuitValue: deck_1.SUIT_VALUE_MAP[highestSuitCard.suit],
                description: `Triple ${rank}s`,
            };
        }
        return null;
    }
    // 4 Cards is NOT a valid combination in standard Big Two (Bombs are played with 5 cards)
    if (count === 4) {
        return null;
    }
    // 5-Card Combinations
    if (count === 5) {
        return analyzeFiveCardHand(sorted);
    }
    return null;
}
function analyzeFiveCardHand(sorted) {
    // Check if all cards have the same suit (Flush candidate)
    const isAllSameSuit = sorted.every((c) => c.suit === sorted[0].suit);
    // Count rank frequencies
    const rankCounts = {};
    for (const c of sorted) {
        rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    }
    const countValues = Object.values(rankCounts).sort((a, b) => b - a);
    // Check straight
    const straightMatch = matchStraight(sorted);
    // 1. Straight Flush
    if (isAllSameSuit && straightMatch) {
        const topCard = sorted.find((c) => c.rank === straightMatch.topRank);
        return {
            type: 'STRAIGHT_FLUSH',
            cards: sorted,
            mainRankValue: straightMatch.straightIndex,
            mainSuitValue: deck_1.SUIT_VALUE_MAP[topCard.suit],
            description: `Straight Flush (${straightMatch.topRank}-high of ${deck_1.SUIT_NAMES[topCard.suit]})`,
        };
    }
    // 2. Four of a Kind (Bomb) + 1 Kicker
    if (countValues[0] === 4) {
        const quadRank = Object.keys(rankCounts).find((r) => rankCounts[r] === 4);
        const kickerRank = Object.keys(rankCounts).find((r) => rankCounts[r] === 1);
        return {
            type: 'FOUR_OF_A_KIND',
            cards: sorted,
            mainRankValue: deck_1.RANK_VALUE_MAP[quadRank],
            mainSuitValue: 0,
            secondaryRankValue: deck_1.RANK_VALUE_MAP[kickerRank],
            description: `Four of a Kind: 4x ${quadRank}s with ${kickerRank} kicker`,
        };
    }
    // 3. Full House (3 of a kind + pair)
    if (countValues[0] === 3 && countValues[1] === 2) {
        const tripleRank = Object.keys(rankCounts).find((r) => rankCounts[r] === 3);
        const pairRank = Object.keys(rankCounts).find((r) => rankCounts[r] === 2);
        return {
            type: 'FULL_HOUSE',
            cards: sorted,
            mainRankValue: deck_1.RANK_VALUE_MAP[tripleRank],
            mainSuitValue: 0,
            secondaryRankValue: deck_1.RANK_VALUE_MAP[pairRank],
            description: `Full House: ${tripleRank}s full of ${pairRank}s`,
        };
    }
    // 4. Flush
    if (isAllSameSuit) {
        const highestCard = sorted[sorted.length - 1]; // highest power card in the flush
        return {
            type: 'FLUSH',
            cards: sorted,
            mainRankValue: deck_1.SUIT_VALUE_MAP[highestCard.suit], // Suit determines flush rank in traditional HK
            mainSuitValue: deck_1.RANK_VALUE_MAP[highestCard.rank],
            description: `Flush of ${deck_1.SUIT_NAMES[highestCard.suit]} (${highestCard.rank}-high)`,
        };
    }
    // 5. Straight
    if (straightMatch) {
        const topCard = sorted.find((c) => c.rank === straightMatch.topRank);
        return {
            type: 'STRAIGHT',
            cards: sorted,
            mainRankValue: straightMatch.straightIndex,
            mainSuitValue: deck_1.SUIT_VALUE_MAP[topCard.suit],
            description: `Straight (${straightMatch.topRank}-high, ${topCard.rank}${deck_1.SUIT_SYMBOLS[topCard.suit]})`,
        };
    }
    return null;
}
function matchStraight(sorted) {
    const ranksInHand = new Set(sorted.map((c) => c.rank));
    if (ranksInHand.size !== 5)
        return null; // Straights cannot have duplicate ranks
    for (const def of exports.STRAIGHT_DEFINITIONS) {
        if (def.ranks.every((r) => ranksInHand.has(r))) {
            return { straightIndex: def.straightIndex, topRank: def.topRank };
        }
    }
    return null;
}
/**
 * Evaluates whether hand A strictly beats hand B in Big Two.
 */
function beats(newHand, prevHand) {
    // If card counts do not match, illegal move in standard rules
    if (newHand.cards.length !== prevHand.cards.length) {
        return false;
    }
    // 1-card, 2-card, 3-card plays must match exact type
    if (newHand.cards.length < 5) {
        if (newHand.type !== prevHand.type)
            return false;
        if (newHand.mainRankValue !== prevHand.mainRankValue) {
            return newHand.mainRankValue > prevHand.mainRankValue;
        }
        return newHand.mainSuitValue > prevHand.mainSuitValue;
    }
    // 5-Card Combinations
    const newCatPower = exports.FIVE_CARD_CATEGORY_POWER[newHand.type];
    const prevCatPower = exports.FIVE_CARD_CATEGORY_POWER[prevHand.type];
    if (newCatPower !== prevCatPower) {
        return newCatPower > prevCatPower;
    }
    // Same 5-card category comparisons:
    switch (newHand.type) {
        case 'STRAIGHT':
        case 'STRAIGHT_FLUSH':
            if (newHand.mainRankValue !== prevHand.mainRankValue) {
                return newHand.mainRankValue > prevHand.mainRankValue;
            }
            return newHand.mainSuitValue > prevHand.mainSuitValue;
        case 'FLUSH':
            // Compare flush suit first
            if (newHand.mainRankValue !== prevHand.mainRankValue) {
                return newHand.mainRankValue > prevHand.mainRankValue;
            }
            // If same suit, compare highest card rank
            return newHand.mainSuitValue > prevHand.mainSuitValue;
        case 'FULL_HOUSE':
        case 'FOUR_OF_A_KIND':
            return newHand.mainRankValue > prevHand.mainRankValue;
        default:
            return false;
    }
}
/**
 * Validates a proposed move by a player against table rules.
 */
function validatePlay(selectedCards, lastPlay, isFreeLead, isFirstTrickOfGame) {
    if (!selectedCards || selectedCards.length === 0) {
        return { isValid: false, combination: null, errorMessage: 'No cards selected.' };
    }
    const combination = analyzeCombination(selectedCards);
    if (!combination) {
        return {
            isValid: false,
            combination: null,
            errorMessage: 'Selected cards do not form a valid Big Two combination (Single, Pair, Triple, Straight, Flush, Full House, Four of a Kind, or Straight Flush).',
        };
    }
    // Opening trick requirement: MUST contain 3 of Diamonds (3D)
    if (isFirstTrickOfGame) {
        const has3D = selectedCards.some((c) => c.rank === '3' && c.suit === 'D');
        if (!has3D) {
            return {
                isValid: false,
                combination,
                errorMessage: 'The first play of the game must include the 3 of Diamonds (♦3).',
            };
        }
    }
    // If table is free lead (everyone passed, or first play), any valid combination is allowed
    if (isFreeLead || !lastPlay) {
        return { isValid: true, combination };
    }
    // Must match card count
    if (selectedCards.length !== lastPlay.cards.length) {
        return {
            isValid: false,
            combination,
            errorMessage: `You must play exactly ${lastPlay.cards.length} card(s) to match the table.`,
        };
    }
    // Must beat previous hand
    if (!beats(combination, lastPlay)) {
        return {
            isValid: false,
            combination,
            errorMessage: `Your play (${combination.description}) does not beat the current table play (${lastPlay.description}).`,
        };
    }
    return { isValid: true, combination };
}
