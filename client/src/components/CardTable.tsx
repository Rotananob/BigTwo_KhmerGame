import React, { useMemo, useState } from 'react';
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
  Globe,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CardView } from './CardView';
import { PlayerSeat } from './PlayerSeat';
import { ScoreModal } from './ScoreModal';
import { generateCandidateCombinations } from '@shared/ai';
import { sound } from '../utils/audio';

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
    chatMessages,
    sortBy,
    lang,
    setLang,
    t,
    toggleCardSelect,
    selectCards,
    clearSelection,
    playSelectedCards,
    passCurrentTurn,
    autoHint,
    toggleSort,
    toggleMute,
    toggleReady,
    toggleBotFill,
    startGame,
    sendChat,
    leaveRoom,
  } = useGame();

  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [localToast, setLocalToast] = useState<string | null>(null);
  const [combCycle, setCombCycle] = useState<{ type: string; index: number }>({ type: '', index: 0 });

  const showLocalToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 2500);
  };

  const cycleCombinations = (category: 'PAIR' | 'TRIPLE' | 'FIVE') => {
    const candidates = generateCandidateCombinations(myHand);
    let filtered: typeof candidates = [];

    if (category === 'PAIR') {
      filtered = candidates.filter((c) => c.type === 'PAIR');
      if (filtered.length === 0) {
        showLocalToast(t.noPairsInHand);
        return;
      }
    } else if (category === 'TRIPLE') {
      filtered = candidates.filter((c) => c.type === 'TRIPLE');
      if (filtered.length === 0) {
        showLocalToast(t.noTriplesInHand);
        return;
      }
    } else if (category === 'FIVE') {
      filtered = candidates.filter((c) => c.cards.length === 5);
      if (filtered.length === 0) {
        showLocalToast(t.noFiveCardsInHand);
        return;
      }
    }

    const nextIndex = (combCycle.type === category ? combCycle.index + 1 : 0) % filtered.length;
    setCombCycle({ type: category, index: nextIndex });
    selectCards(filtered[nextIndex].cards.map((c) => c.id));
    sound.playCardSelect();
  };

  const copyRoomCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChat(chatInput.trim());
      setChatInput('');
    }
  };

  const sendQuickChat = (msg: string) => {
    sendChat(msg);
  };

  const toggleLanguage = () => {
    setLang(lang === 'km' ? 'en' : 'km');
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
      <header className="z-30 px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="font-serif font-black text-amber-400 text-lg">♠</span>
            <span className="font-extrabold text-white text-sm sm:text-base tracking-tight truncate max-w-[120px] sm:max-w-xs">
              {gameState.roomName}
            </span>
          </div>
          <button
            onClick={copyRoomCode}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 border border-amber-500/30 transition-all font-mono"
            title={t.copyCode}
          >
            <span>{gameState.roomCode}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-medium">
            {t.round} {gameState.roundNumber}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Quick Chat Toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Chat & Quick Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'km' ? 'KM' : 'EN'}</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Rules Guide Button */}
          <button
            onClick={onOpenRules}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title={t.rules}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Leave Button */}
          <button
            onClick={leaveRoom}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.leave}</span>
          </button>
        </div>
      </header>

      {/* Main Table Felt Stage */}
      <main className="relative flex-1 flex items-center justify-center p-2 sm:p-6">
        {/* Toast Notification */}
        {(errorToast || localToast) && (
          <div className="absolute top-4 z-40 px-4 py-2 rounded-2xl bg-amber-600 text-white font-semibold text-xs sm:text-sm shadow-xl animate-in slide-in-from-top duration-200">
            {errorToast || localToast}
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
              turnDeadline={gameState?.turnDeadline}
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
              turnDeadline={gameState?.turnDeadline}
            />

            {/* Central Table Trick Area */}
            <div className="flex flex-col items-center justify-center text-center max-w-sm sm:max-w-md">
              {isWaiting ? (
                <div className="flex flex-col items-center space-y-4 p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
                  <div className="text-amber-300 font-extrabold text-lg sm:text-xl">
                    {t.waitingRoom}
                  </div>
                  <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                    {t.waitingDesc}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      onClick={toggleReady}
                      className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{gameState.players[mySeatIndex]?.isReady ? `${t.markReady} ✓` : t.markReady}</span>
                    </button>

                    <button
                      onClick={() => toggleBotFill(!gameState.players.some((p) => p?.isBot))}
                      className="px-4 py-2 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{gameState.players.some((p) => p?.isBot) ? t.removeBots : t.fillBots}</span>
                    </button>

                    <button
                      onClick={startGame}
                      className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-all shadow-lg active:scale-95"
                    >
                      <Play className="w-4 h-4" />
                      <span>{t.startGame}</span>
                    </button>
                  </div>
                </div>
              ) : isPlaying ? (
                <div className="flex flex-col items-center">
                  {/* Status announcement badge */}
                  {gameState.isFirstTrickOfGame ? (
                    <div className="mb-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-pulse">
                      {t.starterTrickBanner}
                    </div>
                  ) : gameState.isFreeLead ? (
                    <div className="mb-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                      {t.freeLeadBanner}
                    </div>
                  ) : (
                    <div className="mb-2 text-xs font-bold text-slate-200">
                      {t.beatPlay} {gameState.lastPlay?.playerName}
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
                      <div className="mt-2 px-3 py-1 rounded-xl bg-black/70 border border-amber-500/30 text-amber-300 text-xs font-bold shadow">
                        {gameState.lastPlay.combination.description}
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-32 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center text-slate-400 text-xs font-medium">
                      {t.tableClear}
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
              turnDeadline={gameState?.turnDeadline}
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
              turnDeadline={gameState?.turnDeadline}
            />
          </div>
        </div>
      </main>

      {/* In-Game Quick Chat Drawer */}
      {chatOpen && (
        <div className="z-40 fixed top-16 right-4 w-72 sm:w-80 bg-slate-900/95 border border-slate-700 rounded-3xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-right duration-200 flex flex-col max-h-96">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span>Quick Tactical Chat</span>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          {/* Quick Chat Pills */}
          <div className="grid grid-cols-2 gap-1.5 py-2 border-b border-slate-800 text-[11px]">
            <button
              onClick={() => sendQuickChat(t.quickChatGood)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 truncate"
            >
              {t.quickChatGood}
            </button>
            <button
              onClick={() => sendQuickChat(t.quickChatPass)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 truncate"
            >
              {t.quickChatPass}
            </button>
            <button
              onClick={() => sendQuickChat(t.quickChatThink)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 truncate"
            >
              {t.quickChatThink}
            </button>
            <button
              onClick={() => sendQuickChat(t.quickChatHurry)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 truncate"
            >
              {t.quickChatHurry}
            </button>
            <button
              onClick={() => sendQuickChat(t.quickChatStuck)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 truncate"
            >
              {t.quickChatStuck}
            </button>
            <button
              onClick={() => sendQuickChat(t.quickChatRematch)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 truncate"
            >
              {t.quickChatRematch}
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2 text-xs max-h-40">
            {chatMessages.length === 0 ? (
              <div className="text-slate-500 text-center py-4 text-[11px]">No messages yet</div>
            ) : (
              chatMessages.map((m, i) => (
                <div key={i} className="p-1.5 rounded-lg bg-slate-800/60">
                  <span className="font-bold text-amber-300">{m.sender}: </span>
                  <span className="text-slate-200">{m.text}</span>
                </div>
              ))
            )}
          </div>

          {/* Custom Input */}
          <form onSubmit={handleSendChat} className="flex space-x-1.5 pt-2">
            <input
              type="text"
              placeholder={t.chatPlaceholder}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-amber-400"
              maxLength={100}
            />
            <button type="submit" className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Control & Hand Deck Area */}
      <footer className="z-30 w-full bg-slate-900/95 border-t border-slate-800 p-2 sm:p-4 backdrop-blur-md flex flex-col items-center">
        {/* Combination Pill / Notification Bar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-2 px-2 text-xs">
          <div className="flex items-center space-x-2">
            {isMyTurn && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                {t.yourTurn}
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
                {selectedCombination.description} {validationStatus.isValid ? `✓ ${t.valid}` : `✗ ${t.invalid}`}
              </span>
            ) : selectedCardIds.length > 0 ? (
              <span className="px-3 py-0.5 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                {selectedCardIds.length} {t.selectedCards}
              </span>
            ) : (
              <span className="text-slate-400">{t.selectHint}</span>
            )}
          </div>

          {/* Smart Combination Quick Selectors & Sort */}
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            <button
              onClick={() => cycleCombinations('PAIR')}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 border border-slate-700 font-semibold transition-all active:scale-95"
              title="Cycle Pairs in hand"
            >
              {t.filterPairs}
            </button>
            <button
              onClick={() => cycleCombinations('TRIPLE')}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 border border-slate-700 font-semibold transition-all active:scale-95"
              title="Cycle Triples in hand"
            >
              {t.filterTriples}
            </button>
            <button
              onClick={() => cycleCombinations('FIVE')}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 border border-slate-700 font-semibold transition-all active:scale-95"
              title="Cycle 5-Card hands"
            >
              {t.filterFiveCard}
            </button>
            <button
              onClick={toggleSort}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-all font-medium"
              title="Toggle Sorting"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortBy === 'rank' ? t.sortRank : t.sortSuit}</span>
            </button>
            {selectedCardIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-400 hover:text-white transition-all font-medium"
              >
                <XCircle className="w-3 h-3" />
                <span>{t.clearSelection}</span>
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
            className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow active:scale-95"
            title="Automatically suggests the lowest legal play"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.hintBtn}</span>
          </button>

          <button
            onClick={passCurrentTurn}
            disabled={!isMyTurn || gameState.isFreeLead || gameState.isFirstTrickOfGame}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow active:scale-95"
          >
            <SkipForward className="w-4 h-4" />
            <span>{t.passBtn}</span>
          </button>

          <button
            onClick={playSelectedCards}
            disabled={!isMyTurn || !validationStatus.isValid || selectedCardIds.length === 0}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-lg active:scale-95 ${
              isMyTurn && validationStatus.isValid && selectedCardIds.length > 0
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{t.playCardsBtn}</span>
          </button>
        </div>
      </footer>

      {/* Score Modal popup upon round completion */}
      <ScoreModal />
    </div>
  );
};
