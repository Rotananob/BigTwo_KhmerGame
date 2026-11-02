import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Card,
  ClientToServerEvents,
  GameStatePublic,
  HandCombination,
  ServerToClientEvents,
} from '@shared/types';
import { analyzeCombination, validatePlay } from '@shared/rules';
import { sortCardsByBigTwo, sortCardsBySuit } from '@shared/deck';
import { findLegalPlays } from '@shared/ai';
import { sound } from '../utils/audio';
import { Language, translations } from '../utils/i18n';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  isGuest: boolean;
  gamesPlayed?: number;
  gamesWon?: number;
  totalScore?: number;
}

interface GameContextType {
  user: UserProfile | null;
  gameState: GameStatePublic | null;
  myHand: Card[];
  selectedCardIds: string[];
  selectedCombination: HandCombination | null;
  validationStatus: { isValid: boolean; message?: string };
  soundMuted: boolean;
  errorToast: string | null;
  chatMessages: { sender: string; text: string; timestamp: number }[];
  sortBy: 'rank' | 'suit';
  lang: Language;
  t: typeof translations['km'];
  setLang: (lang: Language) => void;
  setUser: (user: UserProfile) => void;
  createRoom: (roomName: string, fillBots: boolean) => void;
  joinRoom: (roomCode: string) => void;
  toggleReady: () => void;
  toggleBotFill: (fill: boolean) => void;
  startGame: () => void;
  toggleCardSelect: (cardId: string) => void;
  clearSelection: () => void;
  playSelectedCards: () => void;
  passCurrentTurn: () => void;
  autoHint: () => void;
  toggleSort: () => void;
  toggleMute: () => void;
  sendChat: (text: string) => void;
  requestRematch: () => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [user, setUserState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bigtwo_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [gameState, setGameState] = useState<GameStatePublic | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [soundMuted, setSoundMuted] = useState<boolean>(() => sound.getMuted());
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; timestamp: number }[]>([]);
  const [sortBy, setSortBy] = useState<'rank' | 'suit'>('rank');
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('bigtwo_lang');
      if (savedLang === 'en' || savedLang === 'km') return savedLang;
    } catch {}
    return 'km'; // Default to Khmer as requested!
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('bigtwo_lang', newLang);
  };

  const t = useMemo(() => translations[lang], [lang]);

  // Load or generate guest account on mount
  useEffect(() => {
    if (!user) {
      fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUserState(data.user);
            localStorage.setItem('bigtwo_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          const fallbackUser: UserProfile = {
            id: `guest-${Math.random().toString(36).substring(2, 9)}`,
            username: `Player_${Math.floor(1000 + Math.random() * 9000)}`,
            avatar: '👤',
            isGuest: true,
          };
          setUserState(fallbackUser);
          localStorage.setItem('bigtwo_user', JSON.stringify(fallbackUser));
        });
    }
  }, [user]);

  // Connect socket
  useEffect(() => {
    if (!user) return;

    const s: Socket<ServerToClientEvents, ClientToServerEvents> = io({
      auth: {
        playerId: user.id,
        playerName: user.username,
        avatar: user.avatar,
      },
      reconnectionAttempts: 5,
    });

    s.on('room_state', (state) => {
      setGameState(state);
    });

    s.on('your_hand', (cards) => {
      setMyHand(cards);
    });

    s.on('play_error', (msg) => {
      sound.playError();
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 3500);
    });

    s.on('card_played', () => {
      sound.playCardPlay();
      clearSelection();
    });

    s.on('player_passed', () => {
      sound.playPass();
    });

    s.on('trick_cleared', () => {
      sound.playTrickClear();
    });

    s.on('game_over', () => {
      sound.playWin();
    });

    s.on('chat_message', (msg) => {
      setChatMessages((prev) => [...prev.slice(-40), msg]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
    localStorage.setItem('bigtwo_user', JSON.stringify(newUser));
  };

  // Sort hand whenever sortBy or myHand changes
  const sortedHand = useMemo(() => {
    if (sortBy === 'suit') {
      return sortCardsBySuit(myHand);
    }
    return sortCardsByBigTwo(myHand);
  }, [myHand, sortBy]);

  const selectedCards = useMemo(() => {
    const set = new Set(selectedCardIds);
    return sortedHand.filter((c) => set.has(c.id));
  }, [sortedHand, selectedCardIds]);

  const selectedCombination = useMemo(() => {
    return analyzeCombination(selectedCards);
  }, [selectedCards]);

  const validationStatus = useMemo(() => {
    if (!gameState || gameState.status !== 'PLAYING') {
      return { isValid: false };
    }
    const mySeat = gameState.players.findIndex((p) => p && p.id === user?.id);
    const isMyTurn = gameState.currentTurnSeat === mySeat;

    if (!isMyTurn) {
      return { isValid: false, message: 'Wait for your turn.' };
    }

    if (selectedCards.length === 0) {
      return { isValid: false };
    }

    const lastComb = gameState.lastPlay ? gameState.lastPlay.combination : null;
    const res = validatePlay(
      selectedCards,
      lastComb,
      gameState.isFreeLead,
      gameState.isFirstTrickOfGame
    );

    return { isValid: res.isValid, message: res.errorMessage };
  }, [gameState, user, selectedCards]);

  const createRoom = (roomName: string, fillBots: boolean) => {
    if (!socket || !user) return;
    socket.emit('create_room', {
      roomName,
      playerName: user.username,
      avatar: user.avatar,
      fillBots,
    });
  };

  const joinRoom = (roomCode: string) => {
    if (!socket || !user) return;
    socket.emit('join_room', {
      roomCode,
      playerName: user.username,
      avatar: user.avatar,
    });
  };

  const toggleReady = () => {
    if (!socket) return;
    socket.emit('toggle_ready');
  };

  const toggleBotFill = (fill: boolean) => {
    if (!socket) return;
    socket.emit('toggle_bot_fill', fill);
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('start_game');
  };

  const toggleCardSelect = (cardId: string) => {
    sound.playCardSelect();
    setSelectedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const clearSelection = () => {
    setSelectedCardIds([]);
  };

  const playSelectedCards = () => {
    if (!socket || selectedCardIds.length === 0) return;
    socket.emit('play_cards', selectedCardIds);
  };

  const passCurrentTurn = () => {
    if (!socket) return;
    socket.emit('pass_turn');
  };

  const autoHint = () => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    const lastComb = gameState.lastPlay ? gameState.lastPlay.combination : null;
    const legalMoves = findLegalPlays(
      myHand,
      lastComb,
      gameState.isFreeLead,
      gameState.isFirstTrickOfGame
    );

    if (legalMoves.length > 0) {
      const best = legalMoves[0];
      setSelectedCardIds(best.cards.map((c) => c.id));
      sound.playCardSelect();
    } else {
      setErrorToast('No legal cards to beat the current hand. You should Pass.');
      setTimeout(() => setErrorToast(null), 3000);
    }
  };

  const toggleSort = () => {
    setSortBy((prev) => (prev === 'rank' ? 'suit' : 'rank'));
  };

  const toggleMute = () => {
    const next = !soundMuted;
    sound.setMuted(next);
    setSoundMuted(next);
  };

  const sendChat = (text: string) => {
    if (!socket || !text) return;
    socket.emit('send_chat', text);
  };

  const requestRematch = () => {
    if (!socket) return;
    socket.emit('request_rematch');
  };

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    setGameState(null);
    setMyHand([]);
    setSelectedCardIds([]);
  };

  return (
    <GameContext.Provider
      value={{
        user,
        gameState,
        myHand: sortedHand,
        selectedCardIds,
        selectedCombination,
        validationStatus,
        soundMuted,
        errorToast,
        chatMessages,
        sortBy,
        lang,
        t,
        setLang,
        setUser,
        createRoom,
        joinRoom,
        toggleReady,
        toggleBotFill,
        startGame,
        toggleCardSelect,
        clearSelection,
        playSelectedCards,
        passCurrentTurn,
        autoHint,
        toggleSort,
        toggleMute,
        sendChat,
        requestRematch,
        leaveRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
