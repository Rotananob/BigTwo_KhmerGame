import React from 'react';
import { PlayerPublicInfo } from '../../../shared/types';
import { CardView } from './CardView';

interface PlayerSeatProps {
  player: PlayerPublicInfo | null;
  seatIndex: number;
  position: 'bottom' | 'top' | 'left' | 'right';
  isCurrentTurn: boolean;
  isHost: boolean;
  score: number;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  position,
  isCurrentTurn,
  isHost,
  score,
}) => {
  if (!player) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-white/10 bg-black/20 text-slate-500 text-xs w-28 h-28 sm:w-32 sm:h-32 transition-all`}
      >
        <span className="text-2xl mb-1 opacity-40">🪑</span>
        <span>Empty Seat</span>
      </div>
    );
  }

  const isBottom = position === 'bottom';

  return (
    <div
      className={`relative flex ${
        isBottom ? 'flex-row items-center space-x-3' : 'flex-col items-center'
      } transition-all duration-300`}
    >
      {/* Avatar Container with Active Turn Glow */}
      <div className="relative">
        <div
          className={`
            w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl transition-all duration-300
            ${
              isCurrentTurn
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse scale-105'
                : 'bg-slate-800 border-2 border-slate-700/80 text-white'
            }
          `}
        >
          {player.avatar || '👤'}
        </div>

        {/* Host Crown */}
        {isHost && (
          <span className="absolute -top-2.5 -right-2 text-base" title="Room Host">
            👑
          </span>
        )}

        {/* Card Count Badge (For other players) */}
        {!isBottom && (
          <div className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-amber-300 shadow flex items-center space-x-1">
            <span>🂠</span>
            <span>{player.cardCount}</span>
          </div>
        )}

        {/* Passed Status Banner */}
        {player.hasPassed && (
          <div className="absolute inset-0 bg-black/70 rounded-2xl backdrop-blur-xs flex items-center justify-center z-10 animate-in fade-in">
            <span className="text-[10px] sm:text-xs font-black uppercase text-red-400 tracking-wider">
              PASSED
            </span>
          </div>
        )}
      </div>

      {/* Name and Meta */}
      <div className={`mt-1.5 flex flex-col ${isBottom ? 'text-left' : 'items-center text-center'}`}>
        <div className="flex items-center space-x-1">
          <span className="text-xs sm:text-sm font-bold text-slate-100 max-w-[90px] sm:max-w-[120px] truncate">
            {player.name}
          </span>
          {player.isBot && (
            <span className="text-[9px] font-bold px-1 rounded bg-blue-900/60 text-blue-300 border border-blue-500/30">
              BOT
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>{score} pts</span>
          {player.isReady && (
            <span className="text-emerald-400 font-semibold">• Ready</span>
          )}
        </div>
      </div>

      {/* Mini Card Back stack preview for top/left/right players */}
      {!isBottom && player.cardCount > 0 && (
        <div className="mt-1 flex -space-x-3.5 opacity-80">
          {Array.from({ length: Math.min(player.cardCount, 5) }).map((_, idx) => (
            <CardView key={idx} faceDown size="sm" className="scale-75 shadow-sm" />
          ))}
        </div>
      )}
    </div>
  );
};
