import React from 'react';
import { X, Award, ShieldAlert, Sparkles, HelpCircle, Swords } from 'lucide-react';
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
              {lang === 'km' ? 'ច្បាប់លេងបៀរ ទៀងឡែន (Tien Len / Thirteen)' : 'How To Play Tien Len (Thirteen)'}
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
                ? 'ល្បែងបៀរ ទៀងឡែន (Tiến Lên / Thirteen) ប្រើប្រាស់សន្លឹកបៀរស្តង់ដារ ៥២ សន្លឹក ក្នុងចំណោមអ្នកលេង ៤ នាក់ (ចែក ១៣ សន្លឹកម្នាក់)។ អ្នកដែលទម្លាក់បៀរអស់ពីដៃមុនគេ គឺជាអ្នកឈ្នះ (បានលេខ ១)។'
                : 'Tien Len (Thirteen) is played with a standard 52-card deck among 4 players (13 cards dealt to each). The first player to shed all cards wins the round.'}
            </p>
          </div>

          {/* Section 2: Card & Suit Hierarchy */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h3 className="text-base font-bold text-white mb-2">
              {lang === 'km' ? '២. លំដាប់ថ្នាក់តម្លៃបៀរ និងផ្កាបៀរ (ទៀងឡែន)' : '2. Card & Suit Hierarchy'}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {lang === 'km' ? 'តម្លៃលេខបៀរ (ពីតូចទៅធំ):' : 'Number Ranks (Low to High):'}
                </span>
                <div className="font-mono text-amber-300 font-bold text-xs sm:text-sm mt-0.5">
                  3 &lt; 4 &lt; 5 &lt; 6 &lt; 7 &lt; 8 &lt; 9 &lt; 10 &lt; J &lt; Q &lt; K &lt; A &lt; <span className="text-yellow-400 font-extrabold">2 (អាពីរ ធំជាងគេបង្អស់)</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {lang === 'km' ? 'តម្លៃផ្កាបៀរ ទៀងឡែន (ពីតូចទៅធំ):' : 'Tien Len Suit Order (Low to High):'}
                </span>
                <div className="font-mono font-bold text-xs sm:text-sm mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-slate-100 font-bold">♠ ប៊ិច (Spades - តូចបំផុត)</span>
                  <span>&lt;</span>
                  <span className="text-slate-300">♣ ជ្វា (Clubs)</span>
                  <span>&lt;</span>
                  <span className="text-red-400">♦ ការ៉ូ (Diamonds)</span>
                  <span>&lt;</span>
                  <span className="text-red-500 font-extrabold">♥ បេះដូង (Hearts - ធំបំផុត)</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 pt-1 border-t border-slate-700/50">
                • {lang === 'km' ? 'សន្លឹកតូចបំផុតក្នុងហ្គេម:' : 'Lowest single card:'} <strong className="text-slate-200">♠3 (៣ ប៊ិច)</strong>
                <br />
                • {lang === 'km' ? 'សន្លឹកធំបំផុតក្នុងហ្គេម:' : 'Highest single card:'} <strong className="text-red-400">♥2 (២ បេះដូង)</strong>
              </div>
            </div>
          </div>

          {/* Section 3: The Opening Move */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-1 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>{lang === 'km' ? '៣. វេនចេញបៀរដំបូងគេ' : '3. First Trick of the Game'}</span>
            </h3>
            <p className="leading-relaxed text-xs sm:text-sm">
              {lang === 'km'
                ? 'ក្នុងជុំទីមួយនៃហ្គេម អ្នកដែលកាន់សន្លឹក ៣ ប៊ិច (♠3) ត្រូវតែចេញមុនគេ ហើយការចេញនោះត្រូវតែមានវត្តមានសន្លឹក ♠3 (អាចជាទោល, គូ, បីសន្លឹក ឬតង)។ ក្នុងជុំបន្តបន្ទាប់ អ្នកដែលឈ្នះជុំមុន គឺជាអ្នកបានសិទ្ធិចេញមុនគេ។'
                : 'In round 1, the player holding the 3 of Spades (♠3) must lead, and their opening move must contain the ♠3. In subsequent rounds, the winner of the previous round leads.'}
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
                <p className="text-slate-400 mt-0.5">{lang === 'km' ? 'ធៀបតាមលេខបៀរ រួចធៀបតាមផ្កា (♠ < ♣ < ♦ < ♥)។' : 'Rank first, then suit (♠ < ♣ < ♦ < ♥).'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <strong className="text-white">{lang === 'km' ? 'គូ (Pair - ២ សន្លឹក):' : 'Pair (2 cards):'}</strong>
                <p className="text-slate-400 mt-0.5">{lang === 'km' ? 'បៀរលេខដូចគ្នា ២ សន្លឹក។ ធៀបតាមផ្កាដែលធំជាងគេ។' : 'Two cards of equal rank. Tie-broken by higher card\'s suit.'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <strong className="text-white">{lang === 'km' ? 'បីសន្លឹក (Triple - ៣ សន្លឹក):' : 'Triple (3 cards):'}</strong>
                <p className="text-slate-400 mt-0.5">{lang === 'km' ? 'បៀរលេខដូចគ្នា ៣ សន្លឹក។' : 'Three cards of equal rank.'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <strong className="text-white">{lang === 'km' ? 'តង / សង់ហ្សង់ (Straight - ៣ ដល់ ១២ សន្លឹក):' : 'Straight (3 to 12 cards):'}</strong>
                <p className="text-slate-400 mt-0.5">{lang === 'km' ? 'បៀរតម្រៀបបន្តបន្ទាប់គ្នា (ឧ. 3-4-5, 7-8-9-10)។ គ្មានសន្លឹក ២ ឡើយ! ត្រូវតែស៊ីដោយតងដែលមានចំនួនសន្លឹកស្មើគ្នា។' : 'Consecutive rank sequence (e.g. 3-4-5). No 2 allowed! Must beat with same card count.'}</p>
              </div>
            </div>
          </div>

          {/* Section 5: Special Cuts / Bombs */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50">
            <h3 className="text-base font-bold text-amber-300 mb-2 flex items-center space-x-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>{lang === 'km' ? '៥. ក្បាច់កាប់អាពីរ (Special Cuts / Bombs)' : '5. Cutting The 2s (Bombs)'}</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 rounded-lg bg-black/40 border border-amber-500/30">
                <strong className="text-amber-400">{lang === 'km' ? '៣ គូជាប់គ្នា (3 Consecutive Pairs):' : '3 Consecutive Pairs:'}</strong>
                <p>{lang === 'km' ? 'ឧ. 4-4, 5-5, 6-6 (៦ សន្លឹក) អាចកាប់សន្លឹក ២ មួយគ្រាប់បាន!' : 'e.g. 4-4, 5-5, 6-6 (6 cards). Can cut any Single 2!'}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-amber-500/30">
                <strong className="text-amber-400">{lang === 'km' ? 'ការ៉េ / ចតុរង្គ (Four of a Kind):' : 'Four of a Kind:'}</strong>
                <p>{lang === 'km' ? 'ឧ. 8-8-8-8 (៤ សន្លឹក) អាចកាប់សន្លឹក ២ មួយគ្រាប់ ឬ គូ ២ បាន!' : 'e.g. 8-8-8-8 (4 cards). Can cut a Single 2 or a Pair of 2s!'}</p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-amber-500/30">
                <strong className="text-amber-400">{lang === 'km' ? '៤ គូជាប់គ្នា (4 Consecutive Pairs):' : '4 Consecutive Pairs:'}</strong>
                <p>{lang === 'km' ? 'ឧ. 6-6, 7-7, 8-8, 9-9 (៨ សន្លឹក) អាចកាប់បានទាំង ២ មួយ, គូ ២, ការ៉េ, និង ៣ គូជាប់គ្នា!' : 'Can cut any 2, Pair of 2s, Four of a Kind, or 3 Consecutive Pairs!'}</p>
              </div>
            </div>
          </div>

          {/* Section 6: Passing & Sitting Out */}
          <div>
            <h3 className="text-base font-bold text-amber-400 mb-1">
              {lang === 'km' ? '៦. ការបោះវេន (រំលងហើយ ត្រូវរង់ចាំដល់ចប់ជុំ)' : '6. Passing & The Sitting Out Rule'}
            </h3>
            <p className="leading-relaxed text-xs sm:text-sm">
              {lang === 'km'
                ? 'នៅពេលដល់វេន ប្រសិនបើអ្នកចុច "រំលង (Pass)" អ្នកត្រូវអង្គុយរង់ចាំដោយមិនអាចចូលរួមទម្លាក់បៀរក្នុងជុំនោះបានទៀតឡើយ។ នៅពេលអ្នកលេង ៣ នាក់ផ្សេងទៀតបានរំលងទាំងអស់ តុនឹងត្រូវលាងសម្អាត ហើយអ្នកដែលបានទម្លាក់បៀរចុងក្រោយគេ នឹងទទួលបាន "សេរីភាពទម្លាក់បៀរ (បានដៃចេញមុន)" សម្រាប់ជុំថ្មី។'
                : 'Once you Pass during a trick, you cannot play again until that trick ends! When all opponents have passed, the table clears, and the trick winner earns a Free Lead to start a new trick with any combination.'}
            </p>
          </div>

          {/* Section 7: Trapped 2s Penalties */}
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40">
            <h3 className="text-base font-bold text-red-300 mb-1 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{lang === 'km' ? '៧. ការគិតពិន្ទុ និងស្អុយអាពីរ' : '7. Scoring & Trapped 2s Penalties'}</span>
            </h3>
            <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
              <li>{lang === 'km' ? 'សន្លឹកនៅសល់ ១ ដល់ ៩: ១ ពិន្ទុក្នុង ១ សន្លឹក។' : '1 to 9 cards left: 1 point penalty per card.'}</li>
              <li>{lang === 'km' ? 'សន្លឹកនៅសល់ ១០ ដល់ ១២: ពិន័យគុណនឹង ២ (2x Penalty)។' : '10 to 12 cards left: Double Penalty (2x).'}</li>
              <li>{lang === 'km' ? 'សន្លឹកនៅសល់ ១៣ (កក មិនទាន់ចេញមួយសន្លឹក): ពិន័យគុណនឹង ៣ (3x Shutout)!' : '13 cards left (Shutout): Triple Penalty (3x)!'}</li>
              <li>{lang === 'km' ? 'ស្អុយអាពីរខ្មៅ (♠2, ♣2): ពិន័យបន្ថែម ២ ពិន្ទុ។' : 'Trapped Black 2 (♠2, ♣2): +2 penalty points.'}</li>
              <li>{lang === 'km' ? 'ស្អុយអាពីរក្រហម (♦2, ♥2): ពិន័យបន្ថែម ៤ ពិន្ទុ។' : 'Trapped Red 2 (♦2, ♥2): +4 penalty points.'}</li>
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
