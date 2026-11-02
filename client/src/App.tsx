import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { Lobby } from './components/Lobby';
import { CardTable } from './components/CardTable';
import { RulesModal } from './components/RulesModal';

export const App: React.FC = () => {
  const { gameState } = useGame();
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {gameState ? (
        <CardTable onOpenRules={() => setIsRulesOpen(true)} />
      ) : (
        <Lobby onOpenRules={() => setIsRulesOpen(true)} />
      )}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
};

export default App;
