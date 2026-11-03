import React, { useState, useEffect } from 'react';
import {
  Users,
  Bot,
  PlusCircle,
  LogIn,
  Trophy,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Key,
  Layers,
  Crown,
  Globe,
  Settings,
  Download,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AvatarIcon } from './AvatarIcon';
import { AuthModal } from './AuthModal';
import { getApiUrl } from '../config';

interface LobbyProps {
  onOpenRules: () => void;
}

interface RoomSummary {
  code: string;
  name: string;
  players: number;
  status: string;
  fillBots: boolean;
}

interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
}

export const Lobby: React.FC<LobbyProps> = ({ onOpenRules }) => {
  const { user, createRoom, joinRoom, soundMuted, toggleMute, lang, setLang, t } = useGame();

  const [activeTab, setActiveTab] = useState<'tables' | 'leaderboard'>('tables');
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [fillBotsOption, setFillBotsOption] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const fetchRooms = () => {
    fetch(getApiUrl('/api/rooms'))
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch(() => {});
  };

  const fetchLeaderboard = () => {
    fetch(getApiUrl('/api/leaderboard'))
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRooms();
    fetchLeaderboard();
    const interval = setInterval(fetchRooms, 5000);

    // Auto-detect invite link with ?join=ROOMCODE
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode && joinCode.trim().length > 0) {
      const code = joinCode.trim().toUpperCase();
      setJoinCodeInput(code);
      if (code.length === 6) {
        joinRoom(code);
      }
    }

    return () => clearInterval(interval);
  }, [joinRoom]);

  const handleStartPractice = () => {
    createRoom(lang === 'km' ? 'បន្ទប់ហាត់សម' : 'Practice Room', true);
  };

  const handleCreateCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(newRoomName || `${user?.username || 'Player'}'s Table`, fillBotsOption);
    setIsCreateModalOpen(false);
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCodeInput.trim().length > 0) {
      joinRoom(joinCodeInput.trim().toUpperCase());
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'km' ? 'en' : 'km');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <span className="text-xl leading-none">♠</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>{t.appTitle}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {lang === 'km' ? 'ទៀងឡែន ១៣ សន្លឹក' : 'Tien Len 13 Cards'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* User Card, Settings, Language Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={handleInstallPWA}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1 transition-all"
              title={t.installApp}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.installApp}</span>
            </button>
          )}

          {/* User Profile Card */}
          {user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
              title="Profile & Settings"
            >
              <AvatarIcon type={user.avatar} size="sm" className="rounded-xl" />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  {user.username}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold leading-tight">
                  {user.totalScore || 0} pts
                </span>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'km' ? 'ភាសាខ្មែរ' : 'EN'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Rules Modal Button */}
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t.rules}</span>
          </button>
        </div>
      </header>

      {/* Hero Quick Action Cards */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col space-y-6 sm:space-y-8">
        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Solo Practice vs 3 Bots */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl flex flex-col justify-between hover:border-emerald-500/60 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.soloPractice}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.soloPracticeDesc}
              </p>
            </div>
            <button
              onClick={handleStartPractice}
              className="mt-6 w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.playVsBotsBtn}</span>
            </button>
          </div>

          {/* 2. Create Multiplayer Room */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col justify-between hover:border-amber-500/60 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.createTable}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.createTableDesc}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.createTableBtn}</span>
            </button>
          </div>

          {/* 3. Join Table by Code */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/50 via-slate-900 to-slate-900 border border-blue-500/30 shadow-xl flex flex-col justify-between hover:border-blue-500/60 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.joinByCode}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.joinByCodeDesc}
              </p>
            </div>
            <form onSubmit={handleJoinWithCode} className="mt-6 flex space-x-2">
              <input
                type="text"
                placeholder={t.enterCodePlaceholder}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 font-mono font-bold text-center tracking-widest text-amber-300 placeholder:text-slate-600 focus:outline-hidden focus:border-blue-400 uppercase text-sm"
                maxLength={8}
              />
              <button
                type="submit"
                disabled={!joinCodeInput.trim()}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-sm transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Tab Navigation & Lists */}
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('tables')}
                className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'tables'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t.activeTables} ({rooms.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'leaderboard'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>{t.leaderboard}</span>
              </button>
            </div>

            <button
              onClick={() => {
                fetchRooms();
                fetchLeaderboard();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Tables Tab */}
          {activeTab === 'tables' ? (
            <div className="flex-1">
              {rooms.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                  <Layers className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-400">{t.noActiveTables}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.noTablesSubtitle}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rooms.map((r) => (
                    <div
                      key={r.code}
                      className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between hover:border-slate-600 transition-all"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{r.name}</div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
                          <span className="font-mono text-amber-400 font-bold">{r.code}</span>
                          <span>•</span>
                          <span>{r.players}/4 {t.playersCount}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => joinRoom(r.code)}
                        disabled={r.players >= 4 && r.status !== 'WAITING'}
                        className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all active:scale-95"
                      >
                        {t.joinBtn}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Leaderboard Tab */
            <div className="flex-1 space-y-2 max-h-96 overflow-y-auto">
              {leaderboard.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  {lang === 'km' ? 'មិនទាន់មានកំណត់ត្រាពិន្ទុទេ។ លេងជុំដំបូងរបស់អ្នកឥឡូវនេះ!' : 'No match records yet. Play your first round to get ranked!'}
                </div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 text-center font-bold text-amber-400 text-xs sm:text-sm">
                        {idx === 0 ? (
                          <Crown className="w-5 h-5 mx-auto text-amber-400" />
                        ) : (
                          `#${idx + 1}`
                        )}
                      </div>
                      <AvatarIcon type={item.avatar} size="sm" className="rounded-xl" />
                      <div>
                        <span className="font-bold text-white">{item.username}</span>
                        <div className="text-xs text-slate-400">
                          {item.gamesWon} / {item.gamesPlayed} ({item.gamesPlayed > 0 ? Math.round((item.gamesWon / item.gamesPlayed) * 100) : 0}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-400">{item.totalScore}</span>
                      <span className="text-xs text-slate-400 ml-1">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Table Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-4">{t.createTable}</h2>
            <form onSubmit={handleCreateCustomRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.tableNameLabel}
                </label>
                <input
                  type="text"
                  placeholder={`${user?.username || 'Player'}'s Table`}
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:border-amber-400"
                  maxLength={30}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center space-x-2.5">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-bold text-white">{t.autoFillBotsLabel}</div>
                    <div className="text-xs text-slate-400">{t.autoFillBotsSub}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={fillBotsOption}
                  onChange={(e) => setFillBotsOption(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm transition-all shadow active:scale-95"
                >
                  {t.createAndJoin}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile & Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer */}
      <footer className="px-6 py-3.5 bg-slate-950 border-t border-slate-800/80 text-center text-xs text-slate-500">
        Big Two (鋤大D / ធំពីរ) • PWA Mobile & Desktop • Zero-Emoji Production Engine
      </footer>
    </div>
  );
};
