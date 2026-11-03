import React, { useState, useRef } from 'react';
import { X, Upload, Shield, LogIn, UserPlus, Check } from 'lucide-react';
import { useGame, UserProfile } from '../context/GameContext';
import { AvatarIcon } from './AvatarIcon';
import { getApiUrl } from '../config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = ['spade', 'crown', 'shield', 'flame', 'star', 'diamond'];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, t } = useGame();
  const [tab, setTab] = useState<'profile' | 'login' | 'register'>('profile');
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'spade');
  const [authError, setAuthError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Image Upload and save to localStorage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use FileReader and Canvas to scale down image to 128x128 for lightweight localStorage storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 128, 128);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedAvatar(dataUrl);
          localStorage.setItem('bigtwo_custom_avatar', dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      username: usernameInput.trim() || user.username,
      avatar: selectedAvatar,
    };
    setUser(updated);
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          avatar: selectedAvatar,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Registration failed');
        return;
      }
      setUser(data.user);
      onClose();
    } catch {
      setAuthError('Connection error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Login failed');
        return;
      }
      setUser(data.user);
      onClose();
    } catch {
      setAuthError('Connection error');
    }
  };

  const handleGoogleSignIn = () => {
    // Client-side Google Sign-In profile generation
    const googleNames = ['Sovann', 'Vireak', 'Kosal', 'Bopha', 'Rithy', 'Chhaya'];
    const randomName = `${googleNames[Math.floor(Math.random() * googleNames.length)]}_Google`;
    const googleUser: UserProfile = {
      id: `google-${Math.random().toString(36).substring(2, 9)}`,
      username: randomName,
      avatar: selectedAvatar || 'crown',
      isGuest: false,
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
    };
    setUser(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {tab === 'profile' ? 'Profile & Avatar Settings' : tab === 'login' ? 'Account Login' : 'Create Account'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 my-4 text-xs font-bold">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 pb-2 border-b-2 transition-all ${
              tab === 'profile' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
            }`}
          >
            Profile & Avatar
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 pb-2 border-b-2 transition-all ${
              tab === 'login' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 pb-2 border-b-2 transition-all ${
              tab === 'register' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
            }`}
          >
            Register
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs text-center font-medium">
            {authError}
          </div>
        )}

        {/* Tab 1: Profile & Avatar Upload */}
        {tab === 'profile' && (
          <div className="space-y-4">
            {/* Active Preview */}
            <div className="flex flex-col items-center py-2">
              <AvatarIcon type={selectedAvatar} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-[11px] text-slate-500 mt-1">Saved locally in your browser (LocalStorage)</span>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t.selectAvatar}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`p-1 rounded-xl transition-all ${
                      selectedAvatar === av ? 'ring-2 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <AvatarIcon type={av} size="md" />
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:border-amber-400"
                maxLength={20}
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow active:scale-95 flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Login */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm transition-all shadow flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </form>
        )}

        {/* Tab 3: Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Choose Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 4 chars)</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm transition-all shadow flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </form>
        )}

        {/* Sign in with Google Option */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
