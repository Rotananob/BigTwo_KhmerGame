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
  Check,
  Edit2,
} from 'lucide-react';
import { useGame } from '../context/GameContext';

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
  const { user, setUser, createRoom, joinRoom, soundMuted, toggleMute } = useGame();

  const [activeTab, setActiveTab] = useState<'tables' | 'leaderboard'>('tables');
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [fillBotsOption, setFillBotsOption] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.username || '');

  const fetchRooms = () => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch(() => {});
  };

  const fetchLeaderboard = () => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRooms();
    fetchLeaderboard();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveName = () => {
    if (user && nameInput.trim().length >= 2) {
      setUser({ ...user, username: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleStartPractice = () => {
    createRoom('Practice Room', true);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
            ♠️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>BIG TWO</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                鋤大D
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Professional 4-Player Online Card Club
            </p>
          </div>
        </div>

        {/* User Card / Settings */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="text-lg">{user.avatar}</span>
              {isEditingName ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-24 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-400 text-xs font-bold text-white focus:outline-hidden"
                    maxLength={16}
                  />
                  <button onClick={handleSaveName} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    {user.username}
                  </span>
                  <button
                    onClick={() => {
                      setNameInput(user.username);
                      setIsEditingName(true);
                    }}
                    className="text-slate-400 hover:text-amber-400"
                    title="Change Name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </header>

      {/* Hero Quick Action Banners */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col space-y-8">
        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Solo Practice vs 3 Bots */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl flex flex-col justify-between hover:border-emerald-500/60 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-4">
                🤖
              </div>
              <h3 className="text-lg font-black text-white">Solo Practice Mode</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Play immediately against 3 intelligent AI bots. Great for practicing Big Two combinations and strategy.
              </p>
            </div>
            <button
              onClick={handleStartPractice}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Play vs 3 Bots</span>
            </button>
          </div>

          {/* 2. Create Multiplayer Room */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col justify-between hover:border-amber-500/60 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-4">
                🂠
              </div>
              <h3 className="text-lg font-black text-white">Create Table</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Host a custom 4-player game table. Share your 6-character room code with friends to play online.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Table</span>
            </button>
          </div>

          {/* 3. Join Table by Code */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/50 via-slate-900 to-slate-900 border border-blue-500/30 shadow-xl flex flex-col justify-between hover:border-blue-500/60 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-4">
                🔑
              </div>
              <h3 className="text-lg font-black text-white">Join by Code</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Enter an existing table code from a friend to jump straight into their room.
              </p>
            </div>
            <form onSubmit={handleJoinWithCode} className="mt-6 flex space-x-2">
              <input
                type="text"
                placeholder="ROOM CODE"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono font-bold text-center tracking-widest text-amber-300 placeholder:text-slate-600 focus:outline-hidden focus:border-blue-400 uppercase text-sm"
                maxLength={8}
              />
              <button
                type="submit"
                disabled={!joinCodeInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-sm transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Tab Navigation & Lists */}
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
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
                <span>Active Tables ({rooms.length})</span>
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
                <span>Leaderboard</span>
              </button>
            </div>

            <button
              onClick={() => {
                fetchRooms();
                fetchLeaderboard();
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
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
                  <span className="text-4xl mb-2 opacity-40">🂠</span>
                  <p className="text-sm font-semibold text-slate-400">No active tables at this moment.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Create a table or start solo practice to begin!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rooms.map((r) => (
                    <div
                      key={r.code}
                      className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between hover:border-slate-600 transition-all"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{r.name}</div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
                          <span className="font-mono text-amber-400 font-bold">{r.code}</span>
                          <span>•</span>
                          <span>{r.players}/4 Players</span>
                        </div>
                      </div>
                      <button
                        onClick={() => joinRoom(r.code)}
                        disabled={r.players >= 4 && r.status !== 'WAITING'}
                        className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all active:scale-95"
                      >
                        Join
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
                  No match records yet. Play your first round to get ranked!
                </div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 text-center font-bold text-amber-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                      <span className="text-lg">{item.avatar}</span>
                      <div>
                        <span className="font-bold text-white">{item.username}</span>
                        <div className="text-xs text-slate-400">
                          {item.gamesWon} wins / {item.gamesPlayed} played ({item.gamesPlayed > 0 ? Math.round((item.gamesWon / item.gamesPlayed) * 100) : 0}% win rate)
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Create New Game Table</h2>
            <form onSubmit={handleCreateCustomRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  placeholder={`${user?.username || 'Player'}'s Table`}
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:border-amber-400"
                  maxLength={30}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center space-x-2.5">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-bold text-white">Auto-fill with Bots</div>
                    <div className="text-xs text-slate-400">
                      Empty seats will be filled by AI bots
                    </div>
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
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm transition-all shadow active:scale-95"
                >
                  Create & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 text-center text-xs text-slate-500">
        Big Two (鋤大D / 大老二) • Production-Grade Multiplayer Engine • Antigravity 2.0
      </footer>
    </div>
  );
};
