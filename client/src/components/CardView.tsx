import React from 'react';
import { Card } from '@shared/types';
import { SUIT_NAMES, SUIT_SYMBOLS } from '@shared/deck';

interface CardViewProps {
  card?: Card;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
  highlight?: boolean;
  className?: string;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  selected = false,
  disabled = false,
  onClick,
  faceDown = false,
  size = 'md',
  dimmed = false,
  highlight = false,
  className = '',
}) => {
  const isRed = card ? card.suit === 'H' || card.suit === 'D' : false;

  // Size configurations
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs rounded',
    md: 'w-16 h-24 sm:w-20 sm:h-28 text-sm sm:text-base rounded-md',
    lg: 'w-20 h-28 sm:w-24 sm:h-36 text-base sm:text-lg rounded-lg',
  }[size];

  if (faceDown || !card) {
    return (
      <div
        className={`relative select-none border-2 border-amber-600/60 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 shadow-card flex items-center justify-center overflow-hidden transition-all duration-200 ${sizeClasses} ${className}`}
      >
        {/* Card back crosshatch pattern */}
        <div className="absolute inset-1 border border-amber-400/30 rounded flex items-center justify-center bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:8px_8px] opacity-40"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-amber-400/50 flex items-center justify-center bg-blue-900/40 text-amber-300 text-xs sm:text-sm font-bold">
          ♠
        </div>
      </div>
    );
  }

  const suitColor = isRed ? 'text-red-600' : 'text-slate-900';
  const isBigTwo = card.rank === '2';
  const is3D = card.rank === '3' && card.suit === 'D';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative select-none bg-white text-slate-900 border border-slate-300 shadow-card
        flex flex-col justify-between p-1 sm:p-1.5 transition-all duration-200
        ${sizeClasses}
        ${!disabled && onClick ? 'cursor-pointer hover:shadow-card-hover' : ''}
        ${selected ? '-translate-y-5 sm:-translate-y-6 ring-2 ring-yellow-400 shadow-xl z-20 bg-amber-50/50' : 'hover:-translate-y-1.5'}
        ${dimmed ? 'opacity-40 grayscale-[40%]' : 'opacity-100'}
        ${highlight ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}
        ${is3D ? 'border-amber-400/80 ring-1 ring-amber-300' : ''}
        ${className}
      `}
      title={`${card.rank} of ${SUIT_NAMES[card.suit]}`}
    >
      {/* Top Left Corner */}
      <div className={`flex flex-col items-center leading-none font-bold ${suitColor}`}>
        <span className="tracking-tighter">{card.rank}</span>
        <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[card.suit]}</span>
      </div>

      {/* Center Graphic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isBigTwo ? (
          <div className="flex flex-col items-center">
            <span className={`text-xl sm:text-3xl font-black ${suitColor}`}>
              {SUIT_SYMBOLS[card.suit]}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-100/90 px-1 rounded-sm shadow-sm">
              BIG 2
            </span>
          </div>
        ) : is3D ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl text-red-600 animate-pulse">
              ♦
            </span>
            <span className="text-[8px] font-bold uppercase text-amber-700 bg-amber-200/80 px-1 rounded-sm">
              STARTER
            </span>
          </div>
        ) : card.rank === 'A' ? (
          <span className={`text-3xl sm:text-4xl ${suitColor}`}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        ) : ['K', 'Q', 'J'].includes(card.rank) ? (
          <div className={`text-lg sm:text-2xl font-black opacity-80 ${suitColor}`}>
            {card.rank}
          </div>
        ) : (
          <span className={`text-lg sm:text-2xl opacity-75 ${suitColor}`}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        )}
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className={`flex flex-col items-center leading-none font-bold rotate-180 self-end ${suitColor}`}>
        <span className="tracking-tighter">{card.rank}</span>
        <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </div>
  );
};
