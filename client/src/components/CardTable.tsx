import React, { useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  LogOut,
  HelpCircle,
  Play,
  SkipForward,
  Sparkles,
  ArrowUpDown,
  XCircle,
  Copy,
  Check,
  Bot,
  UserCheck,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CardView } from './CardView';
import { PlayerSeat } from './PlayerSeat';
import { ScoreModal } from './ScoreModal';

interface CardTableProps {
  onOpenRules: () => void;
}

export const CardTable: React.FC<CardTableProps> = ({ onOpenRules }) => {
  const {
    user,
    gameState,
    myHand,
    selectedCardIds,
    selectedCombination,
    validationStatus,
    soundMuted,
    errorToast,
    sortBy,
    toggleCardSelect,
    clearSelection,
    playSelectedCards,
    passCurrentTurn,
    autoHint,
    toggleSort,
    toggleMute,
    toggleReady,
    toggleBotFill,
    startGame,
    leaveRoom,
  } = useGame();

  const [copied, setCopied] = React.useState(false);

  const copyRoomCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find local player's seat index
  const mySeatIndex = useMemo(() => {
    if (!gameState || !user) return 0;
    const idx = gameState.players.findIndex((p) => p && p.id === user.id);
    return idx !== -1 ? idx : 0;
  }, [gameState, user]);

  // Relative seat mapping so local player is always at the bottom
  const relativeSeats = useMemo(() => {
    const getSeatAtOffset = (offset: number) => {
      if (!gameState) {
        return {
          player: null,
          seatIndex: 0,
          isCurrentTurn: false,
          score: 0,
        };
      }
      const idx = (mySeatIndex + offset) % 4;
      return {
        player: gameState.players[idx] || null,
        seatIndex: idx,
        isCurrentTurn: gameState.currentTurnSeat === idx && gameState.status === 'PLAYING',
        score: gameState.scores[gameState.players[idx]?.id || ''] || 0,
      };
    };

    return {
      bottom: getSeatAtOffset(0),
      right: getSeatAtOffset(1),
      top: getSeatAtOffset(2),
      left: getSeatAtOffset(3),
    };
  }, [gameState, mySeatIndex]);

  if (!gameState) return null;

  const isMyTurn = gameState.currentTurnSeat === mySeatIndex && gameState.status === 'PLAYING';
  const isPlaying = gameState.status === 'PLAYING';
  const isWaiting = gameState.status === 'WAITING';

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="z-30 px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">♠️</span>
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
              {gameState.roomName}
            </span>
          </div>
          <button
            onClick={copyRoomCode}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 border border-amber-500/30 transition-all"
            title="Click to copy Room Code"
          >
            <span>Code: <strong>{gameState.roomCode}</strong></span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Round {gameState.roundNumber}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenRules}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Game Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={leaveRoom}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main Table Felt Stage */}
      <main className="relative flex-1 flex items-center justify-center p-2 sm:p-6">
        {/* Error Toast Notification */}
        {errorToast && (
          <div className="absolute top-4 z-40 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs sm:text-sm shadow-xl animate-in slide-in-from-top duration-200">
            {errorToast}
          </div>
        )}

        {/* Big Oval Poker Table */}
        <div className="relative w-full max-w-5xl h-[560px] sm:h-[620px] rounded-[100px] sm:rounded-[180px] felt-pattern table-rim border-4 border-amber-900/70 flex flex-col items-center justify-between p-4 sm:p-8">
          {/* Top Player (Opposite) */}
          <div className="z-20">
            <PlayerSeat
              player={relativeSeats.top.player}
              seatIndex={relativeSeats.top.seatIndex}
              position="top"
              isCurrentTurn={relativeSeats.top.isCurrentTurn}
              isHost={relativeSeats.top.seatIndex === 0}
              score={relativeSeats.top.score}
            />
          </div>

          {/* Middle Row: Left Player, Center Trick Area, Right Player */}
          <div className="w-full flex items-center justify-between px-2 sm:px-8 z-10">
            {/* Left Player */}
            <PlayerSeat
              player={relativeSeats.left.player}
              seatIndex={relativeSeats.left.seatIndex}
              position="left"
              isCurrentTurn={relativeSeats.left.isCurrentTurn}
              isHost={relativeSeats.left.seatIndex === 0}
              score={relativeSeats.left.score}
            />

            {/* Central Table Trick Area */}
            <div className="flex flex-col items-center justify-center text-center max-w-sm sm:max-w-md">
              {isWaiting ? (
                <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
                  <div className="text-amber-300 font-extrabold text-lg sm:text-xl">
                    Waiting Room (Lobby)
                  </div>
                  <p className="text-xs text-slate-300 max-w-xs">
                    4 players needed. Share room code <span className="font-mono font-bold text-amber-400">{gameState.roomCode}</span> or fill with smart AI bots.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={toggleReady}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{gameState.players[mySeatIndex]?.isReady ? 'Ready ✓' : 'Mark Ready'}</span>
                    </button>

                    <button
                      onClick={() => toggleBotFill(!gameState.players.some((p) => p?.isBot))}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{gameState.players.some((p) => p?.isBot) ? 'Remove Bots' : 'Fill Bots'}</span>
                    </button>

                    <button
                      onClick={startGame}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-lg active:scale-95"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Game</span>
                    </button>
                  </div>
                </div>
              ) : isPlaying ? (
                <div className="flex flex-col items-center">
                  {/* Status announcement badge */}
                  {gameState.isFirstTrickOfGame ? (
                    <div className="mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-pulse">
                      ♦ First Trick: Opening play must contain the 3 of Diamonds!
                    </div>
                  ) : gameState.isFreeLead ? (
                    <div className="mb-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                      ★ Free Lead: Lead any legal combination
                    </div>
                  ) : (
                    <div className="mb-2 text-xs font-bold text-slate-200">
                      Beat {gameState.lastPlay?.playerName}&apos;s play:
                    </div>
                  )}

                  {/* Trick Played Cards Display */}
                  {gameState.lastPlay ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                      <div className="flex items-center -space-x-4 sm:-space-x-5 py-2">
                        {gameState.lastPlay.combination.cards.map((c) => (
                          <CardView key={c.id} card={c} size="md" className="shadow-2xl" />
                        ))}
                      </div>
                      <div className="mt-2 px-3 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-300 text-xs font-bold shadow">
                        {gameState.lastPlay.combination.description}
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-32 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-slate-400 text-xs font-medium">
                      Table Clear
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Right Player */}
            <PlayerSeat
              player={relativeSeats.right.player}
              seatIndex={relativeSeats.right.seatIndex}
              position="right"
              isCurrentTurn={relativeSeats.right.isCurrentTurn}
              isHost={relativeSeats.right.seatIndex === 0}
              score={relativeSeats.right.score}
            />
          </div>

          {/* Bottom Player (You) */}
          <div className="z-20">
            <PlayerSeat
              player={relativeSeats.bottom.player}
              seatIndex={relativeSeats.bottom.seatIndex}
              position="bottom"
              isCurrentTurn={relativeSeats.bottom.isCurrentTurn}
              isHost={relativeSeats.bottom.seatIndex === 0}
              score={relativeSeats.bottom.score}
            />
          </div>
        </div>
      </main>

      {/* Bottom Control & Hand Deck Area */}
      <footer className="z-30 w-full bg-slate-900/95 border-t border-slate-800 p-2 sm:p-4 backdrop-blur-md flex flex-col items-center">
        {/* Combination Pill / Notification Bar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-2 px-2 text-xs">
          <div className="flex items-center space-x-2">
            {isMyTurn && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                YOUR TURN
              </span>
            )}
            {selectedCombination ? (
              <span
                className={`px-3 py-0.5 rounded-full font-bold border ${
                  validationStatus.isValid
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-950/80 text-red-300 border-red-500/40'
                }`}
              >
                {selectedCombination.description} {validationStatus.isValid ? '✓ Valid' : '✗ Invalid'}
              </span>
            ) : selectedCardIds.length > 0 ? (
              <span className="px-3 py-0.5 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                {selectedCardIds.length} card(s) selected
              </span>
            ) : (
              <span className="text-slate-400">Click cards to select combination</span>
            )}
          </div>

          {/* Sort & Clear buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSort}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Toggle Sorting (By Rank / By Suit)"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {sortBy === 'rank' ? 'Rank' : 'Suit'}</span>
            </button>
            {selectedCardIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Player's Cards Hand (Horizontal Spread) */}
        <div className="w-full max-w-5xl overflow-x-auto py-3 px-2 flex justify-center no-scrollbar">
          <div className="flex -space-x-5 sm:-space-x-8 hover:-space-x-4 sm:hover:-space-x-6 transition-all duration-200 py-4">
            {myHand.map((card) => {
              const isSelected = selectedCardIds.includes(card.id);
              return (
                <CardView
                  key={card.id}
                  card={card}
                  selected={isSelected}
                  size="lg"
                  onClick={() => toggleCardSelect(card.id)}
                  className="transition-transform duration-150 shrink-0"
                />
              );
            })}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="w-full max-w-xl flex items-center justify-center gap-3 pt-1">
          <button
            onClick={autoHint}
            disabled={!isMyTurn}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow active:scale-95"
            title="Automatically suggests the lowest legal play"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hint</span>
          </button>

          <button
            onClick={passCurrentTurn}
            disabled={!isMyTurn || gameState.isFreeLead || gameState.isFirstTrickOfGame}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow active:scale-95"
          >
            <SkipForward className="w-4 h-4" />
            <span>Pass</span>
          </button>

          <button
            onClick={playSelectedCards}
            disabled={!isMyTurn || !validationStatus.isValid || selectedCardIds.length === 0}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-lg active:scale-95 ${
              isMyTurn && validationStatus.isValid && selectedCardIds.length > 0
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Play Cards</span>
          </button>
        </div>
      </footer>

      {/* Score Modal popup upon round completion */}
      <ScoreModal />
    </div>
  );
};
