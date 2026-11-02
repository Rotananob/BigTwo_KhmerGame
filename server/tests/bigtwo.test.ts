import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card, HandCombination } from '../../shared/types';
import {
  createStandardDeck,
  dealBigTwoHands,
  getCardAbsolutePower,
  sortCardsByBigTwo,
} from '../../shared/deck';
import {
  analyzeCombination,
  beats,
  validatePlay,
} from '../../shared/rules';
import { calculateRoundScores } from '../../shared/scoring';
import { chooseBotMove, findLegalPlays } from '../../shared/ai';

describe('Big Two Authentic Game Engine Test Suite', () => {
  it('should generate a 52-card deck with correct ranks and suits', () => {
    const deck = createStandardDeck();
    assert.strictEqual(deck.length, 52);

    const c3D = deck.find((c) => c.rank === '3' && c.suit === 'D')!;
    const c2S = deck.find((c) => c.rank === '2' && c.suit === 'S')!;
    assert.ok(c3D, '3 of Diamonds exists');
    assert.ok(c2S, '2 of Spades exists');

    // 3 of Diamonds should be lowest absolute power (0)
    assert.strictEqual(getCardAbsolutePower(c3D), 0);
    // 2 of Spades should be highest absolute power (12 * 4 + 3 = 51)
    assert.strictEqual(getCardAbsolutePower(c2S), 51);
  });

  it('should deal 13 cards to each of the 4 players and identify the 3 of Diamonds holder', () => {
    const deal = dealBigTwoHands();
    assert.strictEqual(deal.hands.length, 4);
    for (let i = 0; i < 4; i++) {
      assert.strictEqual(deal.hands[i].length, 13);
    }

    const firstPlayerHand = deal.hands[deal.firstTurnSeatIndex];
    const has3D = firstPlayerHand.some((c) => c.rank === '3' && c.suit === 'D');
    assert.strictEqual(has3D, true, 'First player must hold 3 of Diamonds');
  });

  describe('Combination Detection & Hierarchy', () => {
    it('should identify singles and compare by Big Two rank then suit', () => {
      const c3D: Card = { rank: '3', suit: 'D', id: '3D' };
      const c3S: Card = { rank: '3', suit: 'S', id: '3S' };
      const c2D: Card = { rank: '2', suit: 'D', id: '2D' };

      const comb3D = analyzeCombination([c3D])!;
      const comb3S = analyzeCombination([c3S])!;
      const comb2D = analyzeCombination([c2D])!;

      assert.strictEqual(comb3D.type, 'SINGLE');
      assert.strictEqual(beats(comb3S, comb3D), true, '3 of Spades beats 3 of Diamonds');
      assert.strictEqual(beats(comb2D, comb3S), true, '2 of Diamonds beats 3 of Spades');
      assert.strictEqual(beats(comb3D, comb2D), false, '3 of Diamonds does not beat 2 of Diamonds');
    });

    it('should identify pairs and compare by rank and highest suit', () => {
      const pair7Low: Card[] = [
        { rank: '7', suit: 'D', id: '7D' },
        { rank: '7', suit: 'C', id: '7C' },
      ];
      const pair7High: Card[] = [
        { rank: '7', suit: 'H', id: '7H' },
        { rank: '7', suit: 'S', id: '7S' },
      ];
      const pair8: Card[] = [
        { rank: '8', suit: 'D', id: '8D' },
        { rank: '8', suit: 'C', id: '8C' },
      ];

      const comb7Low = analyzeCombination(pair7Low)!;
      const comb7High = analyzeCombination(pair7High)!;
      const comb8 = analyzeCombination(pair8)!;

      assert.strictEqual(comb7Low.type, 'PAIR');
      assert.strictEqual(beats(comb7High, comb7Low), true, 'Pair 7 with Spade beats Pair 7 with Club');
      assert.strictEqual(beats(comb8, comb7High), true, 'Pair 8 beats Pair 7');
    });

    it('should identify triples', () => {
      const triple9: Card[] = [
        { rank: '9', suit: 'D', id: '9D' },
        { rank: '9', suit: 'C', id: '9C' },
        { rank: '9', suit: 'H', id: '9H' },
      ];
      const triple10: Card[] = [
        { rank: '10', suit: 'D', id: '10D' },
        { rank: '10', suit: 'C', id: '10C' },
        { rank: '10', suit: 'S', id: '10S' },
      ];

      const comb9 = analyzeCombination(triple9)!;
      const comb10 = analyzeCombination(triple10)!;

      assert.strictEqual(comb9.type, 'TRIPLE');
      assert.strictEqual(beats(comb10, comb9), true, 'Triple 10 beats Triple 9');
    });

    it('should reject invalid 4-card hands', () => {
      const fourCards: Card[] = [
        { rank: '9', suit: 'D', id: '9D' },
        { rank: '9', suit: 'C', id: '9C' },
        { rank: '9', suit: 'H', id: '9H' },
        { rank: '9', suit: 'S', id: '9S' },
      ];
      assert.strictEqual(analyzeCombination(fourCards), null, '4-card standalone is invalid in Big Two');
    });

    it('should identify 5-card hands and enforce category hierarchy', () => {
      // Straight: 3, 4, 5, 6, 7 (mixed suits)
      const straight: Card[] = [
        { rank: '3', suit: 'D', id: '3D' },
        { rank: '4', suit: 'C', id: '4C' },
        { rank: '5', suit: 'H', id: '5H' },
        { rank: '6', suit: 'S', id: '6S' },
        { rank: '7', suit: 'D', id: '7D' },
      ];
      // Flush: all Hearts
      const flush: Card[] = [
        { rank: '3', suit: 'H', id: '3H' },
        { rank: '5', suit: 'H', id: '5H' },
        { rank: '7', suit: 'H', id: '7H' },
        { rank: '9', suit: 'H', id: '9H' },
        { rank: 'J', suit: 'H', id: 'JH' },
      ];
      // Full House: 8-8-8-K-K
      const fullHouse: Card[] = [
        { rank: '8', suit: 'D', id: '8D' },
        { rank: '8', suit: 'C', id: '8C' },
        { rank: '8', suit: 'S', id: '8S' },
        { rank: 'K', suit: 'H', id: 'KH' },
        { rank: 'K', suit: 'S', id: 'KS' },
      ];
      // Four of a Kind (Bomb): 9-9-9-9 + 3
      const quad: Card[] = [
        { rank: '9', suit: 'D', id: '9D' },
        { rank: '9', suit: 'C', id: '9C' },
        { rank: '9', suit: 'H', id: '9H' },
        { rank: '9', suit: 'S', id: '9S' },
        { rank: '3', suit: 'C', id: '3C' },
      ];
      // Straight Flush: 4-5-6-7-8 all Spades
      const straightFlush: Card[] = [
        { rank: '4', suit: 'S', id: '4S' },
        { rank: '5', suit: 'S', id: '5S' },
        { rank: '6', suit: 'S', id: '6S' },
        { rank: '7', suit: 'S', id: '7S' },
        { rank: '8', suit: 'S', id: '8S' },
      ];

      const cStraight = analyzeCombination(straight)!;
      const cFlush = analyzeCombination(flush)!;
      const cFullHouse = analyzeCombination(fullHouse)!;
      const cQuad = analyzeCombination(quad)!;
      const cStraightFlush = analyzeCombination(straightFlush)!;

      assert.strictEqual(cStraight.type, 'STRAIGHT');
      assert.strictEqual(cFlush.type, 'FLUSH');
      assert.strictEqual(cFullHouse.type, 'FULL_HOUSE');
      assert.strictEqual(cQuad.type, 'FOUR_OF_A_KIND');
      assert.strictEqual(cStraightFlush.type, 'STRAIGHT_FLUSH');

      // Category hierarchy checks:
      assert.strictEqual(beats(cFlush, cStraight), true, 'Flush beats Straight');
      assert.strictEqual(beats(cFullHouse, cFlush), true, 'Full House beats Flush');
      assert.strictEqual(beats(cQuad, cFullHouse), true, 'Quad beats Full House');
      assert.strictEqual(beats(cStraightFlush, cQuad), true, 'Straight Flush beats Quad');
    });
  });

  describe('Move Validation & Opening Turn Restrictions', () => {
    it('should require 3 of Diamonds on the opening trick of the game', () => {
      const c3D: Card = { rank: '3', suit: 'D', id: '3D' };
      const c3S: Card = { rank: '3', suit: 'S', id: '3S' };

      const validOpen = validatePlay([c3D], null, true, true);
      assert.strictEqual(validOpen.isValid, true, 'Single 3D is valid opener');

      const invalidOpen = validatePlay([c3S], null, true, true);
      assert.strictEqual(invalidOpen.isValid, false, 'Single 3S is invalid opener');
      assert.match(invalidOpen.errorMessage!, /3 of Diamonds/);
    });

    it('should reject plays with mismatched card count', () => {
      const singlePlay = analyzeCombination([{ rank: '5', suit: 'D', id: '5D' }])!;
      const pair = [
        { rank: '7', suit: 'D', id: '7D' },
        { rank: '7', suit: 'S', id: '7S' },
      ];
      const result = validatePlay(pair, singlePlay, false, false);
      assert.strictEqual(result.isValid, false);
      assert.match(result.errorMessage!, /match the table/);
    });
  });

  describe('Scoring & Penalty Calculations', () => {
    it('should calculate standard card penalties, doubling for 10-12, and tripling for 13', () => {
      const players = [
        { playerId: 'p1', playerName: 'Alice', seatIndex: 0, remainingCards: [] }, // Winner (0 cards)
        { playerId: 'p2', playerName: 'Bob', seatIndex: 1, remainingCards: new Array(5).fill({} as Card) }, // 5 cards -> 5 pts
        { playerId: 'p3', playerName: 'Charlie', seatIndex: 2, remainingCards: new Array(10).fill({} as Card) }, // 10 cards -> 20 pts (double)
        { playerId: 'p4', playerName: 'David', seatIndex: 3, remainingCards: new Array(13).fill({} as Card) }, // 13 cards -> 39 pts (triple)
      ];

      const summary = calculateRoundScores('p1', players);
      assert.strictEqual(summary.winnerId, 'p1');

      const bob = summary.seatDeltas.find((s) => s.playerId === 'p2')!;
      const charlie = summary.seatDeltas.find((s) => s.playerId === 'p3')!;
      const david = summary.seatDeltas.find((s) => s.playerId === 'p4')!;
      const alice = summary.seatDeltas.find((s) => s.playerId === 'p1')!;

      assert.strictEqual(bob.pointsDelta, -5);
      assert.strictEqual(charlie.pointsDelta, -20);
      assert.strictEqual(david.pointsDelta, -39);
      assert.strictEqual(alice.pointsDelta, 5 + 20 + 39); // 64 points
    });
  });

  describe('AI Bot Move Selection', () => {
    it('should choose a legal play containing 3D on first turn if holding it', () => {
      const botHand: Card[] = [
        { rank: '3', suit: 'D', id: '3D' },
        { rank: '3', suit: 'S', id: '3S' },
        { rank: '7', suit: 'H', id: '7H' },
        { rank: '2', suit: 'S', id: '2S' },
      ];

      const move = chooseBotMove(botHand, null, true, true, [13, 13, 13]);
      assert.ok(move, 'Bot must make a move');
      const has3D = move.cards.some((c) => c.rank === '3' && c.suit === 'D');
      assert.strictEqual(has3D, true, 'Bot move on first turn must contain 3D');
    });

    it('should find legal winning play or pass if unable to beat', () => {
      const botHand: Card[] = [
        { rank: '5', suit: 'D', id: '5D' },
        { rank: '6', suit: 'C', id: '6C' },
      ];
      const tablePlay = analyzeCombination([{ rank: 'K', suit: 'S', id: 'KS' }])!;

      const move = chooseBotMove(botHand, tablePlay, false, false, [10, 10, 10]);
      assert.strictEqual(move, null, 'Bot must pass because it cannot beat King of Spades');
    });
  });
});
