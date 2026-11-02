import { Card, HandCombination } from './types';
import { analyzeCombination, beats, validatePlay } from './rules';
import { sortCardsByBigTwo } from './deck';

/**
 * Generates all candidate combinations from a player's hand.
 */
export function generateCandidateCombinations(hand: Card[]): HandCombination[] {
  const candidates: HandCombination[] = [];
  const sorted = sortCardsByBigTwo(hand);
  const n = sorted.length;

  // 1. Singles
  for (let i = 0; i < n; i++) {
    const comb = analyzeCombination([sorted[i]]);
    if (comb) candidates.push(comb);
  }

  // 2. Pairs
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (sorted[i].rank === sorted[j].rank) {
        const comb = analyzeCombination([sorted[i], sorted[j]]);
        if (comb) candidates.push(comb);
      }
    }
  }

  // 3. Triples
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      for (let k = j + 1; k < n; k++) {
        if (sorted[i].rank === sorted[j].rank && sorted[j].rank === sorted[k].rank) {
          const comb = analyzeCombination([sorted[i], sorted[j], sorted[k]]);
          if (comb) candidates.push(comb);
        }
      }
    }
  }

  // 4. 5-Card Hands (Generate 5-card subsets intelligently)
  // Only search 5-card combinations if hand has at least 5 cards
  if (n >= 5) {
    // Generate combinations of size 5
    // Helper function for combinations
    function combine5(start: number, current: Card[]) {
      if (current.length === 5) {
        const comb = analyzeCombination(current);
        if (comb) candidates.push(comb);
        return;
      }
      for (let i = start; i < n; i++) {
        current.push(sorted[i]);
        combine5(i + 1, current);
        current.pop();
      }
    }

    // To prevent exponential explosion if hand has 13 cards (13 C 5 = 1287, which is very fast in JS < 2ms):
    combine5(0, []);
  }

  return candidates;
}

/**
 * Finds all legal combinations that can be played given the current table state.
 */
export function findLegalPlays(
  hand: Card[],
  lastPlay: HandCombination | null,
  isFreeLead: boolean,
  isFirstTrickOfGame: boolean
): HandCombination[] {
  const candidates = generateCandidateCombinations(hand);
  const legalPlays: HandCombination[] = [];

  for (const comb of candidates) {
    const val = validatePlay(comb.cards, lastPlay, isFreeLead, isFirstTrickOfGame);
    if (val.isValid && val.combination) {
      legalPlays.push(val.combination);
    }
  }

  // Sort candidates so lowest/weakest winning combination is first (conservative play)
  legalPlays.sort((a, b) => {
    if (beats(a, b)) return 1;
    if (beats(b, a)) return -1;
    return 0;
  });

  return legalPlays;
}

/**
 * Smart AI heuristic for bot decision making.
 * Returns the chosen HandCombination to play, or null to pass.
 */
export function chooseBotMove(
  hand: Card[],
  lastPlay: HandCombination | null,
  isFreeLead: boolean,
  isFirstTrickOfGame: boolean,
  otherPlayersCardCounts: number[]
): HandCombination | null {
  const legalPlays = findLegalPlays(hand, lastPlay, isFreeLead, isFirstTrickOfGame);

  if (legalPlays.length === 0) {
    return null; // Must pass
  }

  // If free lead, bot MUST play something
  if (isFreeLead || !lastPlay) {
    // Priority:
    // If first trick, play the lowest combination containing 3D
    if (isFirstTrickOfGame) {
      return legalPlays[0];
    }

    // Prefer 5-card hands to clear many cards at once, then triples, pairs, singles
    const fiveCards = legalPlays.filter((p) => p.cards.length === 5);
    if (fiveCards.length > 0) return fiveCards[0];

    const pairs = legalPlays.filter((p) => p.cards.length === 2);
    if (pairs.length > 0) return pairs[0];

    const triples = legalPlays.filter((p) => p.cards.length === 3);
    if (triples.length > 0) return triples[0];

    return legalPlays[0];
  }

  // Following an existing play:
  // Check if any opponent is close to winning (e.g. <= 2 cards)
  const isEmergency = otherPlayersCardCounts.some((count) => count <= 2);

  // If not emergency and the lowest legal play requires burning a high 2 or Quad/Bomb on a low card,
  // the bot may choose to pass to save its power cards
  const lowestPlay = legalPlays[0];

  // If lowest play is a 2 (rankValue = 12) on a small card (< 9) and not emergency, pass 50% of the time
  if (!isEmergency && lowestPlay.mainRankValue === 12 && lastPlay.mainRankValue < 6) {
    // Save high card for later
    return null;
  }

  // Otherwise, play the lowest winning move
  return lowestPlay;
}
