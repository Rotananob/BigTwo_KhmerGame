import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CardView } from './CardView';

export const ScoreModal: React.FC = () => {
  const { gameState, user, requestRematch, leaveRoom } = useGame();

  const summary = gameState?.roundSummary;
  const isWinner = summary?.winnerId === user?.id;

  useEffect(() => {
    if (isWinner) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isWinner]);

  if (!gameState || gameState.status !== 'ROUND_OVER' || !summary) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isWinner ? '🎉 Victory! You Won The Round!' : `${summary.winnerName} Won The Round!`}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Round {gameState.roundNumber - 1} Complete — Card penalties and point distribution
          </p>
        </div>

        {/* Players Score Table */}
        <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-1">
          {summary.seatDeltas.map((seat) => {
            const isThisWinner = seat.playerId === summary.winnerId;
            const isLocal = seat.playerId === user?.id;

            return (
              <div
                key={seat.playerId}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isThisWinner
                    ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                    : 'bg-slate-800/60 border-slate-700/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold">
                    {isThisWinner ? '👑' : '👤'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">
                        {seat.playerName} {isLocal && '(You)'}
                      </span>
                      {seat.penaltyMultiplier > 1 && (
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-500/30">
                          {seat.penaltyMultiplier}x Penalty
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isThisWinner
                        ? '0 cards left (Winner)'
                        : `${seat.remainingCount} cards remaining`}
                    </div>
                  </div>
                </div>

                {/* Remaining Cards preview */}
                {!isThisWinner && seat.remainingCards && seat.remainingCards.length > 0 && (
                  <div className="flex items-center -space-x-4 overflow-x-auto py-1 max-w-[220px]">
                    {seat.remainingCards.map((c) => (
                      <CardView key={c.id} card={c} size="sm" className="shadow-md shrink-0" />
                    ))}
                  </div>
                )}

                {/* Points */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-lg font-black ${
                      seat.pointsDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {seat.pointsDelta > 0 ? `+${seat.pointsDelta}` : seat.pointsDelta} pts
                  </div>
                  <div className="text-xs text-slate-400">Total: {seat.totalPoints} pts</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={requestRematch}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Next Round</span>
          </button>
          <button
            onClick={leaveRoom}
            className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all active:scale-[0.98]"
          >
            Leave Table
          </button>
        </div>
      </div>
    </div>
  );
};
