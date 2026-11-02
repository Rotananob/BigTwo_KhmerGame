import React from 'react';
import { X, Award, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">How To Play Big Two (鋤大D)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-sm text-slate-300 pr-1">
          {/* Section 1: Objective & Deck */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-1 flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>1. Objective & The Deck</span>
            </h3>
            <p className="leading-relaxed">
              Big Two is played with a standard 52-card deck among 4 players (13 cards dealt to each). The first player to shed all cards wins the round.
            </p>
          </div>

          {/* Section 2: Card Rankings */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <h3 className="text-base font-bold text-white mb-2">2. Card & Suit Hierarchy</h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Number Ranks (Low to High):
                </span>
                <div className="font-mono text-amber-300 font-bold text-xs sm:text-sm mt-0.5">
                  3 &lt; 4 &lt; 5 &lt; 6 &lt; 7 &lt; 8 &lt; 9 &lt; 10 &lt; J &lt; Q &lt; K &lt; A &lt; <span className="text-yellow-400 font-extrabold">2 (Highest)</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Suit Ranks (Low to High):
                </span>
                <div className="font-mono font-bold text-xs sm:text-sm mt-0.5 flex items-center space-x-2">
                  <span className="text-red-400">♦ Diamonds (Lowest)</span>
                  <span>&lt;</span>
                  <span className="text-slate-300">♣ Clubs</span>
                  <span>&lt;</span>
                  <span className="text-red-400">♥ Hearts</span>
                  <span>&lt;</span>
                  <span className="text-slate-100 font-extrabold">♠ Spades (Highest)</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 pt-1">
                • Absolute lowest card: <strong className="text-red-400">♦3 (3 of Diamonds)</strong>
                <br />
                • Absolute highest card: <strong className="text-white">♠2 (2 of Spades)</strong>
              </div>
            </div>
          </div>

          {/* Section 3: The Opening Move */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-1 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>3. The First Trick of the Game</span>
            </h3>
            <p className="leading-relaxed">
              The game always begins with whoever holds the <strong className="text-red-400">3 of Diamonds (♦3)</strong>. Their opening play <em>must</em> include the ♦3 (can be played as a single ♦3, or inside a pair, triple, or 5-card combination).
            </p>
          </div>

          {/* Section 4: Valid Combinations */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-2">4. Valid Combinations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <strong className="text-white">Single (1 card):</strong>
                <p className="text-slate-400 mt-0.5">Beat by higher rank; tie-broken by suit.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <strong className="text-white">Pair (2 cards):</strong>
                <p className="text-slate-400 mt-0.5">Two cards of equal rank. Tie-broken by higher card&apos;s suit.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <strong className="text-white">Triple (3 cards):</strong>
                <p className="text-slate-400 mt-0.5">Three cards of equal rank. Ranked by numeric value.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <strong className="text-white">5-Card Poker Hands:</strong>
                <p className="text-slate-400 mt-0.5">Category hierarchy (Lowest to Highest):</p>
                <ol className="list-decimal pl-4 mt-1 space-y-0.5 text-slate-300">
                  <li>Straight (5 in sequence)</li>
                  <li>Flush (5 same suit)</li>
                  <li>Full House (3 of kind + pair)</li>
                  <li>Four of a Kind (Bomb + 1 kicker)</li>
                  <li>Straight Flush (highest)</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 5: Passing & Free Lead */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-1">5. Passing & The &quot;3 Consecutive Passes&quot; Rule</h3>
            <p className="leading-relaxed">
              When following, you must play the <strong>exact same card count</strong> that beats the table, or <strong>Pass</strong>. When <strong>3 players pass in a row</strong>, the trick ends! The table clears, and the player who played the last card wins the trick and earns a <strong>Free Lead</strong> to play any combination.
            </p>
          </div>

          {/* Section 6: Scoring & Penalties */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40">
            <h3 className="text-base font-bold text-amber-300 mb-1 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>6. Scoring & Multiplier Penalties</span>
            </h3>
            <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
              <li>1 to 9 cards left: <strong>1 point penalty per card</strong>.</li>
              <li>10 to 12 cards left: <strong className="text-red-400">Double Penalty (2x)</strong>.</li>
              <li>13 cards left (Shutout / Monster): <strong className="text-red-400">Triple Penalty (3x) = -39 pts!</strong></li>
              <li>The winner gains all penalty points surrendered by the losers.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all text-sm"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
