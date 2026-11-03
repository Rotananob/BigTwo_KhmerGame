import { Card, HandCombination, Rank } from './types';
import { analyzeCombination, beats, validatePlay } from './rules';
import { RANK_VALUE_MAP, sortCardsByTienLen } from './deck';

/**
 * Generates all candidate Tien Len (ទៀងឡែន) combinations from a player's hand.
 */
export function generateCandidateCombinations(hand: Card[]): HandCombination[] {
  const candidates: HandCombination[] = [];
  const sorted = sortCardsByTienLen(hand);
  const n = sorted.length;

  // 1. Singles (សន្លឹកទោល)
  for (let i = 0; i < n; i++) {
    const comb = analyzeCombination([sorted[i]]);
    if (comb) candidates.push(comb);
  }

  // Group cards by rank
  const cardsByRank: Record<string, Card[]> = {};
  for (const c of sorted) {
    if (!cardsByRank[c.rank]) cardsByRank[c.rank] = [];
    cardsByRank[c.rank].push(c);
  }

  // 2. Pairs (គូ)
  for (const rank in cardsByRank) {
    const cards = cardsByRank[rank];
    if (cards.length >= 2) {
      for (let i = 0; i < cards.length - 1; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const comb = analyzeCombination([cards[i], cards[j]]);
          if (comb) candidates.push(comb);
        }
      }
    }
  }

  // 3. Triples (បីសន្លឹក)
  for (const rank in cardsByRank) {
    const cards = cardsByRank[rank];
    if (cards.length >= 3) {
      for (let i = 0; i < cards.length - 2; i++) {
        for (let j = i + 1; j < cards.length - 1; j++) {
          for (let k = j + 1; k < cards.length; k++) {
            const comb = analyzeCombination([cards[i], cards[j], cards[k]]);
            if (comb) candidates.push(comb);
          }
        }
      }
    }
  }

  // 4. Four of a Kind (ការ៉េ / ចតុរង្គ)
  for (const rank in cardsByRank) {
    const cards = cardsByRank[rank];
    if (cards.length === 4) {
      const comb = analyzeCombination(cards);
      if (comb) candidates.push(comb);
    }
  }

  // 5. Straights (តង / សង់ហ្សង់ ពី ៣ ដល់ ១២ សន្លឹក, គ្មានសន្លឹក ២ ឡើយ)
  // Ranks ordered 3..A
  const straightRanks: Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  // Find all maximal and sub-straights
  for (let startIdx = 0; startIdx < straightRanks.length; startIdx++) {
    // If start rank not in hand, continue
    if (!cardsByRank[straightRanks[startIdx]]?.length) continue;

    let currentLength = 0;
    while (
      startIdx + currentLength < straightRanks.length &&
      cardsByRank[straightRanks[startIdx + currentLength]]?.length
    ) {
      currentLength++;
    }

    // Now for every sub-straight length >= 3
    for (let len = 3; len <= currentLength; len++) {
      // Pick cards for this straight (to keep candidates manageable, pick each available suit combination)
      const rankSlice = straightRanks.slice(startIdx, startIdx + len);
      
      // Recursive builder for straight candidates
      function buildStraight(depth: number, acc: Card[]) {
        if (depth === rankSlice.length) {
          const comb = analyzeCombination(acc);
          if (comb) candidates.push(comb);
          return;
        }
        const available = cardsByRank[rankSlice[depth]] || [];
        for (const c of available) {
          buildStraight(depth + 1, [...acc, c]);
        }
      }
      buildStraight(0, []);
    }
  }

  // 6. Three and Four Consecutive Pairs (៣ គូជាប់គ្នា និង ៤ គូជាប់គ្នា)
  const pairRanks: Rank[] = straightRanks.filter((r) => (cardsByRank[r]?.length || 0) >= 2);
  for (let i = 0; i < pairRanks.length; i++) {
    const r1 = pairRanks[i];
    const r1Val = RANK_VALUE_MAP[r1];

    // Check for 3 consecutive pairs
    const r2 = pairRanks.find((r) => RANK_VALUE_MAP[r] === r1Val + 1);
    const r3 = pairRanks.find((r) => RANK_VALUE_MAP[r] === r1Val + 2);
    if (r2 && r3) {
      const p1 = cardsByRank[r1].slice(0, 2);
      const p2 = cardsByRank[r2].slice(0, 2);
      const p3 = cardsByRank[r3].slice(0, 2);
      const comb3 = analyzeCombination([...p1, ...p2, ...p3]);
      if (comb3) candidates.push(comb3);

      // Check for 4 consecutive pairs
      const r4 = pairRanks.find((r) => RANK_VALUE_MAP[r] === r1Val + 3);
      if (r4) {
        const p4 = cardsByRank[r4].slice(0, 2);
        const comb4 = analyzeCombination([...p1, ...p2, ...p3, ...p4]);
        if (comb4) candidates.push(comb4);
      }
    }
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
 * Smart AI heuristic for Tien Len bot decision making.
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
    // If first trick, play the lowest combination containing 3S (3 of Spades)
    if (isFirstTrickOfGame) {
      return legalPlays[0];
    }

    // Priority for leading:
    // 1. Long straights (clear multiple cards)
    const straightPlays = legalPlays.filter((p) => p.type === 'STRAIGHT');
    if (straightPlays.length > 0) {
      // Pick the longest straight
      return straightPlays.sort((a, b) => b.cardCount - a.cardCount)[0];
    }

    // 2. Triples
    const triples = legalPlays.filter((p) => p.type === 'TRIPLE');
    if (triples.length > 0) return triples[0];

    // 3. Low pairs (avoid leading pairs of 2s early)
    const lowPairs = legalPlays.filter((p) => p.type === 'PAIR' && p.mainRankValue < 12);
    if (lowPairs.length > 0) return lowPairs[0];

    // 4. Low singles (avoid leading 2s)
    const lowSingles = legalPlays.filter((p) => p.type === 'SINGLE' && p.mainRankValue < 12);
    if (lowSingles.length > 0) return lowSingles[0];

    // Fallback: lowest legal play
    return legalPlays[0];
  }

  // Following an opponent's play:
  const minOtherCards = Math.min(...otherPlayersCardCounts.filter((c) => c > 0), 13);
  const emergencyMode = minOtherCards <= 3; // An opponent is close to winning!

  // If opponent played a 2, can we cut it with a bomb?
  const isOpponent2 =
    (lastPlay.type === 'SINGLE' || lastPlay.type === 'PAIR') && lastPlay.mainRankValue === 12;

  if (isOpponent2) {
    // If we have a cut/bomb, decide whether to cut
    const bombs = legalPlays.filter(
      (p) =>
        p.type === 'THREE_CONSECUTIVE_PAIRS' ||
        p.type === 'FOUR_OF_A_KIND' ||
        p.type === 'FOUR_CONSECUTIVE_PAIRS'
    );
    if (bombs.length > 0) {
      return bombs[0]; // Cut the 2! (កាប់អាពីរ)
    }
  }

  // Don't waste high 2s unless emergency or guaranteed trick win
  const nonTwoPlays = legalPlays.filter((p) => p.mainRankValue < 12);
  if (nonTwoPlays.length > 0) {
    return nonTwoPlays[0];
  }

  // If only 2s are available:
  if (emergencyMode || hand.length <= 4) {
    return legalPlays[0];
  }

  // Conserve 2 for later unless table play is already high (e.g. Ace)
  if (lastPlay.mainRankValue >= 10) {
    return legalPlays[0];
  }

  // Pass to save 2
  return null;
}
