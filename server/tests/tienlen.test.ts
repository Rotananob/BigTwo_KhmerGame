import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card, HandCombination } from '../../shared/types';
import {
  createStandardDeck,
  dealTienLenHands,
  getCardAbsolutePower,
  sortCardsByTienLen,
} from '../../shared/deck';
import {
  analyzeCombination,
  beats,
  validatePlay,
} from '../../shared/rules';
import { calculateRoundScores } from '../../shared/scoring';
import { chooseBotMove, findLegalPlays } from '../../shared/ai';

describe('Tien Len (ទៀងឡែន 13 សន្លឹក) Authentic Game Engine Test Suite', () => {
  it('should generate a 52-card deck with correct Tien Len suit and rank ranking', () => {
    const deck = createStandardDeck();
    assert.strictEqual(deck.length, 52);

    const c3S = deck.find((c) => c.rank === '3' && c.suit === 'S')!;
    const c3C = deck.find((c) => c.rank === '3' && c.suit === 'C')!;
    const c3D = deck.find((c) => c.rank === '3' && c.suit === 'D')!;
    const c3H = deck.find((c) => c.rank === '3' && c.suit === 'H')!;
    const c2H = deck.find((c) => c.rank === '2' && c.suit === 'H')!;

    assert.ok(c3S, '3 of Spades exists');
    assert.ok(c2H, '2 of Hearts exists');

    // 3 of Spades (3 ប៊ិច) is the absolute lowest card (power 0)
    assert.strictEqual(getCardAbsolutePower(c3S), 0);
    // Suit ordering: Spades(0) < Clubs(1) < Diamonds(2) < Hearts(3)
    assert.strictEqual(getCardAbsolutePower(c3C), 1);
    assert.strictEqual(getCardAbsolutePower(c3D), 2);
    assert.strictEqual(getCardAbsolutePower(c3H), 3);
    // 2 of Hearts (2 បេះដូង) is the absolute highest card (power 51)
    assert.strictEqual(getCardAbsolutePower(c2H), 51);
  });

  it('should deal 13 cards to each of the 4 players and identify the 3 of Spades holder as starter', () => {
    const deal = dealTienLenHands();
    assert.strictEqual(deal.hands.length, 4);
    for (let i = 0; i < 4; i++) {
      assert.strictEqual(deal.hands[i].length, 13);
    }

    const firstPlayerHand = deal.hands[deal.firstTurnSeatIndex];
    const has3S = firstPlayerHand.some((c) => c.rank === '3' && c.suit === 'S');
    assert.strictEqual(has3S, true, 'First player must hold 3 of Spades (♠3)');
  });

  describe('Combination Detection & Hierarchy', () => {
    it('should identify singles and compare by Tien Len rank then suit (Spades < Clubs < Diamonds < Hearts)', () => {
      const c3S: Card = { rank: '3', suit: 'S', id: '3S' };
      const c3C: Card = { rank: '3', suit: 'C', id: '3C' };
      const c3H: Card = { rank: '3', suit: 'H', id: '3H' };
      const c4S: Card = { rank: '4', suit: 'S', id: '4S' };
      const c2S: Card = { rank: '2', suit: 'S', id: '2S' };
      const c2H: Card = { rank: '2', suit: 'H', id: '2H' };

      const comb3S = analyzeCombination([c3S])!;
      const comb3C = analyzeCombination([c3C])!;
      const comb3H = analyzeCombination([c3H])!;
      const comb4S = analyzeCombination([c4S])!;
      const comb2S = analyzeCombination([c2S])!;
      const comb2H = analyzeCombination([c2H])!;

      assert.strictEqual(comb3S.type, 'SINGLE');
      assert.strictEqual(beats(comb3C, comb3S), true, '3 of Clubs beats 3 of Spades');
      assert.strictEqual(beats(comb3H, comb3C), true, '3 of Hearts beats 3 of Clubs');
      assert.strictEqual(beats(comb4S, comb3H), true, '4 of Spades beats 3 of Hearts');
      assert.strictEqual(beats(comb2H, comb2S), true, '2 of Hearts beats 2 of Spades');
    });

    it('should identify pairs and compare by rank and highest suit in pair', () => {
      const pair7Low: Card[] = [
        { rank: '7', suit: 'S', id: '7S' },
        { rank: '7', suit: 'C', id: '7C' },
      ];
      const pair7High: Card[] = [
        { rank: '7', suit: 'D', id: '7D' },
        { rank: '7', suit: 'H', id: '7H' },
      ];
      const pair8: Card[] = [
        { rank: '8', suit: 'S', id: '8S' },
        { rank: '8', suit: 'C', id: '8C' },
      ];

      const comb7Low = analyzeCombination(pair7Low)!;
      const comb7High = analyzeCombination(pair7High)!;
      const comb8 = analyzeCombination(pair8)!;

      assert.strictEqual(comb7Low.type, 'PAIR');
      assert.strictEqual(beats(comb7High, comb7Low), true, 'Pair 7 with Heart beats Pair 7 with Club');
      assert.strictEqual(beats(comb8, comb7High), true, 'Pair 8 beats Pair 7');
    });

    it('should identify triples', () => {
      const triple9: Card[] = [
        { rank: '9', suit: 'S', id: '9S' },
        { rank: '9', suit: 'C', id: '9C' },
        { rank: '9', suit: 'D', id: '9D' },
      ];
      const triple10: Card[] = [
        { rank: '10', suit: 'C', id: '10C' },
        { rank: '10', suit: 'D', id: '10D' },
        { rank: '10', suit: 'H', id: '10H' },
      ];

      const comb9 = analyzeCombination(triple9)!;
      const comb10 = analyzeCombination(triple10)!;

      assert.strictEqual(comb9.type, 'TRIPLE');
      assert.strictEqual(beats(comb10, comb9), true, 'Triple 10 beats Triple 9');
    });

    it('should identify straights (តង) of arbitrary lengths (3 to 12 cards) and reject 2s in straights', () => {
      // 3-card straight: 4-5-6
      const s3: Card[] = [
        { rank: '4', suit: 'S', id: '4S' },
        { rank: '5', suit: 'C', id: '5C' },
        { rank: '6', suit: 'H', id: '6H' },
      ];
      // 4-card straight: 7-8-9-10
      const s4: Card[] = [
        { rank: '7', suit: 'S', id: '7S' },
        { rank: '8', suit: 'C', id: '8C' },
        { rank: '9', suit: 'D', id: '9D' },
        { rank: '10', suit: 'H', id: '10H' },
      ];
      // Invalid straight containing '2': Q-K-A-2
      const invalidStraightWith2: Card[] = [
        { rank: 'Q', suit: 'S', id: 'QS' },
        { rank: 'K', suit: 'C', id: 'KC' },
        { rank: 'A', suit: 'D', id: 'AD' },
        { rank: '2', suit: 'H', id: '2H' },
      ];

      const combS3 = analyzeCombination(s3)!;
      const combS4 = analyzeCombination(s4)!;
      const combInv = analyzeCombination(invalidStraightWith2);

      assert.strictEqual(combS3.type, 'STRAIGHT');
      assert.strictEqual(combS3.cardCount, 3);
      assert.strictEqual(combS4.type, 'STRAIGHT');
      assert.strictEqual(combS4.cardCount, 4);
      assert.strictEqual(combInv, null, 'Straight cannot include 2 in Tien Len');

      // Higher straight of same length beats lower straight
      const s3Higher: Card[] = [
        { rank: '4', suit: 'C', id: '4C' },
        { rank: '5', suit: 'D', id: '5D' },
        { rank: '6', suit: 'S', id: '6S' },
      ];
      // 6H > 6S
      assert.strictEqual(beats(combS3, analyzeCombination(s3Higher)!), true);
    });

    it('should identify Four of a Kind (ការ៉េ) and 3/4 Consecutive Pairs (គូជាប់គ្នា)', () => {
      // Quad: 9-9-9-9
      const quad9: Card[] = [
        { rank: '9', suit: 'S', id: '9S' },
        { rank: '9', suit: 'C', id: '9C' },
        { rank: '9', suit: 'D', id: '9D' },
        { rank: '9', suit: 'H', id: '9H' },
      ];

      // 3 Consecutive Pairs: 6-6-7-7-8-8
      const threePairs: Card[] = [
        { rank: '6', suit: 'S', id: '6S' },
        { rank: '6', suit: 'C', id: '6C' },
        { rank: '7', suit: 'D', id: '7D' },
        { rank: '7', suit: 'H', id: '7H' },
        { rank: '8', suit: 'S', id: '8S' },
        { rank: '8', suit: 'H', id: '8H' },
      ];

      // 4 Consecutive Pairs: 5-5-6-6-7-7-8-8
      const fourPairs: Card[] = [
        { rank: '5', suit: 'S', id: '5S' },
        { rank: '5', suit: 'C', id: '5C' },
        { rank: '6', suit: 'D', id: '6D' },
        { rank: '6', suit: 'H', id: '6H' },
        { rank: '7', suit: 'S', id: '7S' },
        { rank: '7', suit: 'C', id: '7C' },
        { rank: '8', suit: 'D', id: '8D' },
        { rank: '8', suit: 'H', id: '8H' },
      ];

      const cQuad = analyzeCombination(quad9)!;
      const c3Pairs = analyzeCombination(threePairs)!;
      const c4Pairs = analyzeCombination(fourPairs)!;

      assert.strictEqual(cQuad.type, 'FOUR_OF_A_KIND');
      assert.strictEqual(c3Pairs.type, 'THREE_CONSECUTIVE_PAIRS');
      assert.strictEqual(c4Pairs.type, 'FOUR_CONSECUTIVE_PAIRS');
    });
  });

  describe('Special Bomb Cuts on 2s (កាប់អាពីរ)', () => {
    const single2H: Card = { rank: '2', suit: 'H', id: '2H' };
    const pair2s: Card[] = [
      { rank: '2', suit: 'S', id: '2S' },
      { rank: '2', suit: 'H', id: '2H' },
    ];

    const cSingle2H = analyzeCombination([single2H])!;
    const cPair2s = analyzeCombination(pair2s)!;

    const quad8: Card[] = [
      { rank: '8', suit: 'S', id: '8S' },
      { rank: '8', suit: 'C', id: '8C' },
      { rank: '8', suit: 'D', id: '8D' },
      { rank: '8', suit: 'H', id: '8H' },
    ];
    const cQuad8 = analyzeCombination(quad8)!;

    const threePairs: Card[] = [
      { rank: '5', suit: 'S', id: '5S' },
      { rank: '5', suit: 'C', id: '5C' },
      { rank: '6', suit: 'D', id: '6D' },
      { rank: '6', suit: 'H', id: '6H' },
      { rank: '7', suit: 'S', id: '7S' },
      { rank: '7', suit: 'H', id: '7H' },
    ];
    const c3Pairs = analyzeCombination(threePairs)!;

    const fourPairs: Card[] = [
      { rank: '6', suit: 'S', id: '6S' },
      { rank: '6', suit: 'C', id: '6C' },
      { rank: '7', suit: 'D', id: '7D' },
      { rank: '7', suit: 'H', id: '7H' },
      { rank: '8', suit: 'S', id: '8S' },
      { rank: '8', suit: 'C', id: '8C' },
      { rank: '9', suit: 'D', id: '9D' },
      { rank: '9', suit: 'H', id: '9H' },
    ];
    const c4Pairs = analyzeCombination(fourPairs)!;

    it('3 consecutive pairs can cut a single 2', () => {
      assert.strictEqual(beats(c3Pairs, cSingle2H), true, '3 consecutive pairs cuts a single 2');
      assert.strictEqual(beats(c3Pairs, cPair2s), false, '3 consecutive pairs cannot cut a pair of 2s');
    });

    it('Four of a Kind (ការ៉េ) can cut a single 2 or a pair of 2s, and can cut 3 consecutive pairs', () => {
      assert.strictEqual(beats(cQuad8, cSingle2H), true, 'Quad cuts single 2');
      assert.strictEqual(beats(cQuad8, cPair2s), true, 'Quad cuts pair of 2s');
      assert.strictEqual(beats(cQuad8, c3Pairs), true, 'Quad cuts 3 consecutive pairs');
    });

    it('4 consecutive pairs can cut single 2, pair of 2s, Quad, or 3 consecutive pairs', () => {
      assert.strictEqual(beats(c4Pairs, cSingle2H), true, '4 consecutive pairs cuts single 2');
      assert.strictEqual(beats(c4Pairs, cPair2s), true, '4 consecutive pairs cuts pair of 2s');
      assert.strictEqual(beats(c4Pairs, cQuad8), true, '4 consecutive pairs cuts Four of a Kind');
      assert.strictEqual(beats(c4Pairs, c3Pairs), true, '4 consecutive pairs cuts 3 consecutive pairs');
    });
  });

  describe('Move Validation & 3 of Spades Opening Turn Restriction', () => {
    it('should require 3 of Spades (♠3) on the opening trick of the game', () => {
      const c3S: Card = { rank: '3', suit: 'S', id: '3S' };
      const c3H: Card = { rank: '3', suit: 'H', id: '3H' };

      const validOpen = validatePlay([c3S], null, true, true);
      assert.strictEqual(validOpen.isValid, true, 'Single 3S is valid opener');

      const invalidOpen = validatePlay([c3H], null, true, true);
      assert.strictEqual(invalidOpen.isValid, false, 'Single 3H is invalid opener');
      assert.match(invalidOpen.errorMessage!, /3 of Spades/);
    });
  });

  describe('Scoring & Trapped 2s Penalties (ស្អុយអាពីរ)', () => {
    it('should penalize trapped 2s (+2 for black 2, +4 for red 2) in addition to card counts', () => {
      const players = [
        { playerId: 'p1', playerName: 'Winner', seatIndex: 0, remainingCards: [] }, // Winner (0 cards)
        {
          playerId: 'p2',
          playerName: 'Bob',
          seatIndex: 1,
          remainingCards: [
            { rank: '5', suit: 'S', id: '5S' },
            { rank: '2', suit: 'S', id: '2S' }, // Black 2 -> +2 penalty
          ] as Card[],
        },
        {
          playerId: 'p3',
          playerName: 'Charlie',
          seatIndex: 2,
          remainingCards: [
            { rank: '9', suit: 'D', id: '9D' },
            { rank: '2', suit: 'H', id: '2H' }, // Red 2 -> +4 penalty
          ] as Card[],
        },
        {
          playerId: 'p4',
          playerName: 'David',
          seatIndex: 3,
          remainingCards: [
            { rank: '4', suit: 'S', id: '4S' },
            { rank: '7', suit: 'C', id: '7C' },
          ] as Card[],
        },
      ];

      const summary = calculateRoundScores('p1', players);
      assert.strictEqual(summary.winnerId, 'p1');

      const bob = summary.seatDeltas.find((s) => s.playerId === 'p2')!;
      const charlie = summary.seatDeltas.find((s) => s.playerId === 'p3')!;
      const david = summary.seatDeltas.find((s) => s.playerId === 'p4')!;

      // Bob: 2 cards (-2) + black 2 (-2) = -4
      assert.strictEqual(bob.pointsDelta, -4);
      // Charlie: 2 cards (-2) + red 2 (-4) = -6
      assert.strictEqual(charlie.pointsDelta, -6);
      // David: 2 cards (-2) + no 2 = -2
      assert.strictEqual(david.pointsDelta, -2);
    });
  });

  describe('AI Bot Move Selection for Tien Len', () => {
    it('should choose a legal play containing 3S on first turn if holding it', () => {
      const botHand: Card[] = [
        { rank: '3', suit: 'S', id: '3S' },
        { rank: '3', suit: 'H', id: '3H' },
        { rank: '7', suit: 'H', id: '7H' },
        { rank: '2', suit: 'S', id: '2S' },
      ];

      const move = chooseBotMove(botHand, null, true, true, [13, 13, 13]);
      assert.ok(move, 'Bot must make a move');
      const has3S = move.cards.some((c) => c.rank === '3' && c.suit === 'S');
      assert.strictEqual(has3S, true, 'Bot move on first turn must contain 3 of Spades');
    });
  });
});
