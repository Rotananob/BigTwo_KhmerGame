import React from 'react';
import { X, Award, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useGame();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {lang === 'km' ? 'ច្បាប់លេងបៀរ ធំពីរ (Big Two / 鋤大D)' : 'How To Play Big Two (鋤大D)'}
            </h2>
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
              <span>{lang === 'km' ? '១. គោលដៅ និងចំនួនសន្លឹកបៀរ' : '1. Objective & The Deck'}</span>
            </h3>
            <p className="leading-relaxed text-xs sm:text-sm">
              {lang === 'km'
                ? 'ល្បែងបៀរ ធំពីរ លេងជាមួយបៀរស្តង់ដារ ៥២ សន្លឹកក្នុងចំណោមអ្នកលេង ៤ នាក់ (ចែក ១៣ សន្លឹកម្នាក់)។ អ្នកដែលទម្លាក់បៀរអស់ពីដៃមុនគេ គឺជាអ្នកឈ្នះក្នុងជុំនោះ។'
                : 'Big Two is played with a standard 52-card deck among 4 players (13 cards dealt to each). The first player to shed all cards wins the round.'}
            </p>
          </div>

          {/* Section 2: Card Rankings */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h3 className="text-base font-bold text-white mb-2">
              {lang === 'km' ? '២. លំដាប់ថ្នាក់តម្លៃបៀរ និងផ្កាបៀរ' : '2. Card & Suit Hierarchy'}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {lang === 'km' ? 'តម្លៃលេខបៀរ (ពីតូចទៅធំ):' : 'Number Ranks (Low to High):'}
                </span>
                <div className="font-mono text-amber-300 font-bold text-xs sm:text-sm mt-0.5">
                  3 &lt; 4 &lt; 5 &lt; 6 &lt; 7 &lt; 8 &lt; 9 &lt; 10 &lt; J &lt; Q &lt; K &lt; A &lt; <span className="text-yellow-400 font-extrabold">2 (ធំជាងគេបង្អស់)</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {lang === 'km' ? 'តម្លៃផ្កាបៀរ (ពីតូចទៅធំ):' : 'Suit Ranks (Low to High):'}
                </span>
                <div className="font-mono font-bold text-xs sm:text-sm mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-red-400">♦ ការ៉ូ (Diamonds - តូចបំផុត)</span>
                  <span>&lt;</span>
                  <span className="text-slate-300">♣ ជ្វា (Clubs)</span>
                  <span>&lt;</span>
                  <span className="text-red-400">♥ បេះដូង (Hearts)</span>
                  <span>&lt;</span>
                  <span className="text-slate-100 font-extrabold">♠ ប៊ិច (Spades - ធំបំផុត)</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 pt-1 border-t border-slate-700/50">
                • {lang === 'km' ? 'សន្លឹកតូចបំផុតក្នុងហ្គេម:' : 'Lowest single card:'} <strong className="text-red-400">♦3 (៣ ការ៉ូ)</strong>
                <br />
                • {lang === 'km' ? 'សន្លឹកធំបំផុតក្នុងហ្គេម:' : 'Highest single card:'} <strong className="text-white">♠2 (២ ប៊ិច)</strong>
              </div>
            </div>
          </div>

          {/* Section 3: The Opening Move */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-1 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>{lang === 'km' ? '៣. វេនចេញបៀរដំបូងគេ' : '3. The First Trick of the Game'}</span>
            </h3>
            <p className="leading-relaxed text-xs sm:text-sm">
              {lang === 'km'
                ? 'ហ្គេមចាប់ផ្ដើមដោយអ្នកដែលកាន់សន្លឹក ៣ ការ៉ូ (♦3) ត្រូវចេញមុនគេ។ ការចេញបៀរលើកដំបូងនេះ ត្រូវតែមានវត្តមានសន្លឹក ♦3 ជានិច្ច (អាចចេញជា សន្លឹកទោល, គូ, បីសន្លឹក ឬក្បាច់ ៥ សន្លឹកដែលមាន ♦3)។'
                : 'The game always begins with whoever holds the 3 of Diamonds (♦3). Their opening play must include the ♦3 (can be played as a single ♦3, or inside a pair, triple, or 5-card combination).'}
            </p>
          </div>

          {/* Section 4: Valid Combinations */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-2">
              {lang === 'km' ? '៤. ក្បាច់បៀរស្របច្បាប់' : '4. Valid Combinations'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <strong className="text-white">{lang === 'km' ? 'សន្លឹកទោល (Single - ១ សន្លឹក):' : 'Single (1 card):'}</strong>
                <p className="text-slate-400 mt-0.5">{lang === 'km' ? 'ធៀបតាមលេខបៀរ រួចធៀបតាមផ្កា។' : 'Beat by higher rank; tie-broken by suit.'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <strong className="text-white">{lang === 'km' ? 'គូ (Pair - ២ សន្លឹក):' : 'Pair (2 cards):'}</strong>
                <p className="text-slate-400 mt-0.5">{lang === 'km' ? 'បៀរលេខដូចគ្នា ២ សន្លឹក។ ធៀបតាមផ្កាដែលធំជាងគេ។' : 'Two cards of equal rank. Tie-broken by higher card\'s suit.'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <strong className="text-white">{lang === 'km' ? 'បីសន្លឹក (Triple - ៣ សន្លឹក):' : 'Triple (3 cards):'}</strong>
                <p className="text-slate-400 mt-0.5">{lang === 'km' ? 'បៀរលេខដូចគ្នា ៣ សន្លឹក។ ធៀបតាមតម្លៃលេខបៀរ។' : 'Three cards of equal rank. Ranked by numeric value.'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <strong className="text-white">{lang === 'km' ? 'ក្បាច់ ៥ សន្លឹក (Poker Hands):' : '5-Card Poker Hands:'}</strong>
                <ol className="list-decimal pl-4 mt-1 space-y-0.5 text-slate-300">
                  <li>{lang === 'km' ? 'បៀរតម្រៀប (Straight - ៥ សន្លឹកបន្តបន្ទាប់)' : 'Straight (5 in sequence)'}</li>
                  <li>{lang === 'km' ? 'បៀរផ្កាដូច (Flush - ៥ សន្លឹកផ្កាដូចគ្នា)' : 'Flush (5 same suit)'}</li>
                  <li>{lang === 'km' ? 'គូបី (Full House - បីដូចគ្នា + គូ)' : 'Full House (3 of a kind + pair)'}</li>
                  <li>{lang === 'km' ? 'ការ៉េ (Four of a Kind - ៤ ដូចគ្នា + ១ សន្លឹក)' : 'Four of a Kind (Bomb + 1 kicker)'}</li>
                  <li>{lang === 'km' ? 'តម្រៀបផ្កាដូច (Straight Flush - ធំបំផុត)' : 'Straight Flush (highest)'}</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 5: Passing & Free Lead */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-1">
              {lang === 'km' ? '៥. ការរំលង និងច្បាប់រំលង ៣ នាក់ជាប់គ្នា' : '5. Passing & The "3 Consecutive Passes" Rule'}
            </h3>
            <p className="leading-relaxed text-xs sm:text-sm">
              {lang === 'km'
                ? 'នៅពេលដល់វេន អ្នកត្រូវទម្លាក់ក្បាច់បៀរប្រភេទដូចគ្នា និងចំនួនសន្លឹកដូចគ្នាដែលធំជាងបៀរលើតុ ឬចុច "រំលង (Pass)"។ នៅពេលមានអ្នកលេងរំលង ៣ នាក់ជាប់គ្នា តុនឹងត្រូវសម្អាត ហើយអ្នកដែលបានទម្លាក់បៀរចុងក្រោយគេ នឹងទទួលបាន "សេរីភាពទម្លាក់បៀរ (Free Lead)" ដើម្បីចេញក្បាច់បៀរណាមួយក៏បានតាមចិត្ត។'
                : 'When following, you must play the exact same card count that beats the table, or Pass. When 3 players pass in a row, the trick ends! The table clears, and the trick winner earns a Free Lead to play any combination.'}
            </p>
          </div>

          {/* Section 6: Scoring & Penalties */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40">
            <h3 className="text-base font-bold text-amber-300 mb-1 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{lang === 'km' ? '៦. ការគិតពិន្ទុ និងការពិន័យគុណ' : '6. Scoring & Multiplier Penalties'}</span>
            </h3>
            <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
              <li>{lang === 'km' ? 'សន្លឹកនៅសល់ ១ ដល់ ៩: ពិន័យ ១ ពិន្ទុក្នុង ១ សន្លឹក។' : '1 to 9 cards left: 1 point penalty per card.'}</li>
              <li>{lang === 'km' ? 'សន្លឹកនៅសល់ ១០ ដល់ ១២: ពិន័យគុណនឹង ២ (2x Penalty)។' : '10 to 12 cards left: Double Penalty (2x).'}</li>
              <li>{lang === 'km' ? 'សន្លឹកនៅសល់ ១៣ (មិនទាន់បានចេញបៀរមួយសន្លឹកសោះ): ពិន័យគុណនឹង ៣ (3x Shutout) = ដក ៣៩ ពិន្ទុ!' : '13 cards left (Shutout): Triple Penalty (3x) = -39 pts!'}</li>
              <li>{lang === 'km' ? 'អ្នកឈ្នះទទួលបានពិន្ទុសរុបទាំងអស់ដែលដកពីអ្នកចាញ់។' : 'The winner gains all penalty points surrendered by the losers.'}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all text-xs sm:text-sm active:scale-95 shadow"
          >
            {t.gotItBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
