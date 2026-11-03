import { Card, HandCombination } from './types';
import {
  RANK_VALUE_MAP,
  sortCardsByTienLen,
  SUIT_KHMER_NAMES,
  SUIT_SYMBOLS,
  SUIT_VALUE_MAP,
} from './deck';

/**
 * Helper to check if cards form a valid straight (sequence of consecutive ranks).
 * In Tien Len (ទៀងឡែន), 2 can NEVER be part of a straight!
 */
function checkStraight(sorted: Card[]): { isValid: boolean; topCard?: Card } {
  const count = sorted.length;
  if (count < 3 || count > 12) return { isValid: false };

  // 2 is NEVER allowed in a Tien Len straight
  if (sorted.some((c) => c.rank === '2')) {
    return { isValid: false };
  }

  // Check strict consecutive ranks (no duplicates, difference must be exactly 1)
  for (let i = 0; i < count - 1; i++) {
    const currVal = RANK_VALUE_MAP[sorted[i].rank];
    const nextVal = RANK_VALUE_MAP[sorted[i + 1].rank];
    if (nextVal !== currVal + 1) {
      return { isValid: false };
    }
  }

  return { isValid: true, topCard: sorted[count - 1] };
}

/**
 * Helper to check if cards form 3 or 4 consecutive pairs (តងគូ / ស៊ុីនគូ / đôi thông).
 * In Tien Len, 2 can NEVER be part of consecutive pairs.
 */
function checkConsecutivePairs(
  sorted: Card[],
  requiredPairs: 3 | 4
): { isValid: boolean; topCard?: Card; topPairRank?: string } {
  const count = sorted.length;
  if (count !== requiredPairs * 2) return { isValid: false };

  // 2 is never allowed
  if (sorted.some((c) => c.rank === '2')) {
    return { isValid: false };
  }

  // Each consecutive pair must be equal in rank, and each pair must step up by exactly 1
  for (let p = 0; p < requiredPairs; p++) {
    const c1 = sorted[p * 2];
    const c2 = sorted[p * 2 + 1];
    if (c1.rank !== c2.rank) {
      return { isValid: false };
    }

    if (p > 0) {
      const prevRankVal = RANK_VALUE_MAP[sorted[(p - 1) * 2].rank];
      const currRankVal = RANK_VALUE_MAP[c1.rank];
      if (currRankVal !== prevRankVal + 1) {
        return { isValid: false };
      }
    }
  }

  const topPairSecond = sorted[count - 1]; // highest suit of the top pair
  return {
    isValid: true,
    topCard: topPairSecond,
    topPairRank: sorted[count - 1].rank,
  };
}

/**
 * Analyzes an arbitrary set of cards to determine if they form a legal Tien Len (ទៀងឡែន) combination.
 */
export function analyzeCombination(cards: Card[]): HandCombination | null {
  if (!cards || cards.length === 0) return null;
  const count = cards.length;
  const sorted = sortCardsByTienLen(cards);

  // 1. Single Card (សន្លឹកទោល)
  if (count === 1) {
    const card = sorted[0];
    return {
      type: 'SINGLE',
      cards: sorted,
      cardCount: 1,
      mainRankValue: RANK_VALUE_MAP[card.rank],
      mainSuitValue: SUIT_VALUE_MAP[card.suit],
      description: `${card.rank}${SUIT_SYMBOLS[card.suit]} (${card.rank} ${SUIT_KHMER_NAMES[card.suit]})`,
    };
  }

  // 2. Pair (គូ - ២ សន្លឹកលេខដូចគ្នា)
  if (count === 2) {
    if (sorted[0].rank === sorted[1].rank) {
      const rank = sorted[0].rank;
      const topCard = sorted[1]; // sorted ascending: index 1 has higher suit
      return {
        type: 'PAIR',
        cards: sorted,
        cardCount: 2,
        mainRankValue: RANK_VALUE_MAP[rank],
        mainSuitValue: SUIT_VALUE_MAP[topCard.suit],
        description: `គូ ${rank} (Pair of ${rank}s)`,
      };
    }
    return null;
  }

  // 3. Triple (បីសន្លឹក - ៣ សន្លឹកលេខដូចគ្នា)
  if (count === 3) {
    if (sorted[0].rank === sorted[1].rank && sorted[1].rank === sorted[2].rank) {
      const rank = sorted[0].rank;
      const topCard = sorted[2];
      return {
        type: 'TRIPLE',
        cards: sorted,
        cardCount: 3,
        mainRankValue: RANK_VALUE_MAP[rank],
        mainSuitValue: SUIT_VALUE_MAP[topCard.suit],
        description: `បីសន្លឹក ${rank} (Triple ${rank}s)`,
      };
    }
    // Check if it's a 3-card straight (e.g. 3-4-5)
    const straight3 = checkStraight(sorted);
    if (straight3.isValid && straight3.topCard) {
      return {
        type: 'STRAIGHT',
        cards: sorted,
        cardCount: 3,
        mainRankValue: RANK_VALUE_MAP[straight3.topCard.rank],
        mainSuitValue: SUIT_VALUE_MAP[straight3.topCard.suit],
        description: `តង ៣ សន្លឹក (${sorted[0].rank} ដល់ ${straight3.topCard.rank})`,
      };
    }
    return null;
  }

  // 4. Four Cards
  if (count === 4) {
    // Four of a kind (ចតុរង្គ / ការ៉េ)
    if (
      sorted[0].rank === sorted[1].rank &&
      sorted[1].rank === sorted[2].rank &&
      sorted[2].rank === sorted[3].rank
    ) {
      const rank = sorted[0].rank;
      return {
        type: 'FOUR_OF_A_KIND',
        cards: sorted,
        cardCount: 4,
        mainRankValue: RANK_VALUE_MAP[rank],
        mainSuitValue: 3, // All 4 suits present, top suit is Hearts (3)
        description: `ការ៉េ ${rank} (Four of a Kind ${rank}s)`,
      };
    }

    // 4-card straight (e.g. 7-8-9-10)
    const straight4 = checkStraight(sorted);
    if (straight4.isValid && straight4.topCard) {
      return {
        type: 'STRAIGHT',
        cards: sorted,
        cardCount: 4,
        mainRankValue: RANK_VALUE_MAP[straight4.topCard.rank],
        mainSuitValue: SUIT_VALUE_MAP[straight4.topCard.suit],
        description: `តង ៤ សន្លឹក (${sorted[0].rank} ដល់ ${straight4.topCard.rank})`,
      };
    }
    return null;
  }

  // 5. 6 Cards: Check for 3 Consecutive Pairs or 6-card Straight
  if (count === 6) {
    const threePairs = checkConsecutivePairs(sorted, 3);
    if (threePairs.isValid && threePairs.topCard) {
      return {
        type: 'THREE_CONSECUTIVE_PAIRS',
        cards: sorted,
        cardCount: 6,
        mainRankValue: RANK_VALUE_MAP[threePairs.topCard.rank],
        mainSuitValue: SUIT_VALUE_MAP[threePairs.topCard.suit],
        description: `៣ គូជាប់គ្នា (${sorted[0].rank} ដល់ ${threePairs.topCard.rank})`,
      };
    }
  }

  // 6. 8 Cards: Check for 4 Consecutive Pairs or 8-card Straight
  if (count === 8) {
    const fourPairs = checkConsecutivePairs(sorted, 4);
    if (fourPairs.isValid && fourPairs.topCard) {
      return {
        type: 'FOUR_CONSECUTIVE_PAIRS',
        cards: sorted,
        cardCount: 8,
        mainRankValue: RANK_VALUE_MAP[fourPairs.topCard.rank],
        mainSuitValue: SUIT_VALUE_MAP[fourPairs.topCard.suit],
        description: `៤ គូជាប់គ្នា (${sorted[0].rank} ដល់ ${fourPairs.topCard.rank})`,
      };
    }
  }

  // 7. General Straight (តង / សង់ហ្សង់ ពី ៣ ដល់ ១២ សន្លឹក)
  const straightCheck = checkStraight(sorted);
  if (straightCheck.isValid && straightCheck.topCard) {
    return {
      type: 'STRAIGHT',
      cards: sorted,
      cardCount: count,
      mainRankValue: RANK_VALUE_MAP[straightCheck.topCard.rank],
      mainSuitValue: SUIT_VALUE_MAP[straightCheck.topCard.suit],
      description: `តង ${count} សន្លឹក (${sorted[0].rank} ដល់ ${straightCheck.topCard.rank})`,
    };
  }

  return null;
}

/**
 * Determines whether candidatePlay strictly beats tablePlay under authentic Tien Len (ទៀងឡែន) rules.
 */
export function beats(played: HandCombination, table: HandCombination): boolean {
  // A. Matching combination types (Normal flow)
  if (played.type === table.type) {
    // Straights must have the EXACT same card count
    if (played.type === 'STRAIGHT') {
      if (played.cardCount !== table.cardCount) {
        return false;
      }
      if (played.mainRankValue > table.mainRankValue) return true;
      if (played.mainRankValue === table.mainRankValue) {
        return played.mainSuitValue > table.mainSuitValue;
      }
      return false;
    }

    // Single, Pair, Triple, 3-Pairs, 4-Pairs
    if (played.mainRankValue > table.mainRankValue) return true;
    if (played.mainRankValue === table.mainRankValue) {
      return played.mainSuitValue > table.mainSuitValue;
    }
    return false;
  }

  // B. SPECIAL CUTS (កាប់អាពីរ / Bombs) in Tien Len:

  // 1. Table is a SINGLE 2 (សន្លឹក ២ មួយ)
  const isTableSingle2 = table.type === 'SINGLE' && table.mainRankValue === RANK_VALUE_MAP['2'];
  if (isTableSingle2) {
    // 3 consecutive pairs can cut single 2 (៣ គូជាប់គ្នា កាប់ ២ មួយ)
    if (played.type === 'THREE_CONSECUTIVE_PAIRS') return true;
    // Four of a kind can cut single 2 (ការ៉េ កាប់ ២ មួយ)
    if (played.type === 'FOUR_OF_A_KIND') return true;
    // 4 consecutive pairs can cut single 2 (៤ គូជាប់គ្នា កាប់ ២ មួយ)
    if (played.type === 'FOUR_CONSECUTIVE_PAIRS') return true;
  }

  // 2. Table is a PAIR of 2s (គូ ២)
  const isTablePair2 = table.type === 'PAIR' && table.mainRankValue === RANK_VALUE_MAP['2'];
  if (isTablePair2) {
    // Four of a kind can cut pair of 2s (ការ៉េ កាប់គូ ២)
    if (played.type === 'FOUR_OF_A_KIND') return true;
    // 4 consecutive pairs can cut pair of 2s (៤ គូជាប់គ្នា កាប់គូ ២)
    if (played.type === 'FOUR_CONSECUTIVE_PAIRS') return true;
  }

  // 3. Table is THREE_CONSECUTIVE_PAIRS (៣ គូជាប់គ្នា)
  if (table.type === 'THREE_CONSECUTIVE_PAIRS') {
    // Four of a kind can cut 3 consecutive pairs
    if (played.type === 'FOUR_OF_A_KIND') return true;
    // 4 consecutive pairs can cut 3 consecutive pairs
    if (played.type === 'FOUR_CONSECUTIVE_PAIRS') return true;
  }

  // 4. Table is FOUR_OF_A_KIND (ការ៉េ)
  if (table.type === 'FOUR_OF_A_KIND') {
    // 4 consecutive pairs can cut four of a kind
    if (played.type === 'FOUR_CONSECUTIVE_PAIRS') return true;
  }

  return false;
}

export interface ValidationResult {
  isValid: boolean;
  combination: HandCombination | null;
  errorMessage?: string;
}

/**
 * Validates whether the proposed card play is legal given the current table state.
 */
export function validatePlay(
  cards: Card[],
  lastCombination: HandCombination | null,
  isFreeLead: boolean,
  isFirstTrickOfGame: boolean
): ValidationResult {
  if (!cards || cards.length === 0) {
    return { isValid: false, combination: null, errorMessage: 'គ្មានសន្លឹកបៀរត្រូវបានជ្រើសរើស (No cards selected)' };
  }

  const combination = analyzeCombination(cards);
  if (!combination) {
    return {
      isValid: false,
      combination: null,
      errorMessage: 'ក្បាច់បៀរមិនត្រឹមត្រូវតាមច្បាប់ ទៀងឡែន (Invalid Tien Len combination)',
    };
  }

  // First trick of the game MUST include 3 of Spades (3S / ៣ ប៊ិច)
  if (isFirstTrickOfGame) {
    const has3S = cards.some((c) => c.rank === '3' && c.suit === 'S');
    if (!has3S) {
      return {
        isValid: false,
        combination,
        errorMessage: 'ជុំទីមួយត្រូវតែចេញសន្លឹក ៣ ប៊ិច (3 of Spades ♠) ជានិច្ច!',
      };
    }
  }

  // Free lead allows ANY valid combination
  if (isFreeLead || !lastCombination) {
    return { isValid: true, combination };
  }

  // Must beat the table combination
  if (!beats(combination, lastCombination)) {
    return {
      isValid: false,
      combination,
      errorMessage: `ក្បាច់បៀរនេះមិនអាចស៊ីបៀរលើតុបានទេ (Does not beat ${lastCombination.description})`,
    };
  }

  return { isValid: true, combination };
}
