import { Card, RoundSummary } from './types';

export interface PlayerEndRoundData {
  playerId: string;
  playerName: string;
  seatIndex: number;
  remainingCards: Card[];
}

export function calculateRoundScores(
  winnerId: string,
  players: PlayerEndRoundData[],
  previousScores: Record<string, number> = {}
): RoundSummary {
  const winner = players.find((p) => p.playerId === winnerId) || players[0];
  let winnerGain = 0;

  const seatDeltas = players.map((p) => {
    const isWinner = p.playerId === winnerId;
    const remainingCount = isWinner ? 0 : p.remainingCards.length;

    let penaltyMultiplier = 1;
    if (remainingCount >= 13) {
      penaltyMultiplier = 3; // Shutout (កក / មិនបានចេញបៀរមួយសន្លឹកសោះ) = Triple penalty
    } else if (remainingCount >= 10) {
      penaltyMultiplier = 2; // Double penalty for 10-12 cards
    }

    // Trapped 2s (ស្អុយអាពីរ) penalty:
    let trappedTwosPenalty = 0;
    if (!isWinner) {
      for (const card of p.remainingCards) {
        if (card.rank === '2') {
          // Black 2 (2♠, 2♣) = 2 pts; Red 2 (2♦, 2♥) = 4 pts
          trappedTwosPenalty += (card.suit === 'S' || card.suit === 'C') ? 2 : 4;
        }
      }
    }

    const baseLoss = remainingCount * penaltyMultiplier;
    const lossPoints = isWinner ? 0 : baseLoss + trappedTwosPenalty;
    if (!isWinner) {
      winnerGain += lossPoints;
    }

    const pointsDelta = isWinner ? 0 : -lossPoints;
    const currentScore = previousScores[p.playerId] || 0;

    return {
      playerId: p.playerId,
      playerName: p.playerName,
      seatIndex: p.seatIndex,
      remainingCards: p.remainingCards,
      remainingCount,
      penaltyMultiplier,
      pointsDelta,
      totalPoints: currentScore + pointsDelta,
    };
  });

  // Assign winner gain
  const winnerDelta = seatDeltas.find((s) => s.playerId === winnerId);
  if (winnerDelta) {
    winnerDelta.pointsDelta = winnerGain;
    const currentScore = previousScores[winnerId] || 0;
    winnerDelta.totalPoints = currentScore + winnerGain;
  }

  return {
    winnerId: winner.playerId,
    winnerName: winner.playerName,
    seatDeltas,
  };
}
