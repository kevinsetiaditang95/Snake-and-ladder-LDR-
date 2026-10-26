import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActiveTodState, TodType } from '../types/game';
import { Sparkles, HelpCircle, Flame, RefreshCw, CheckCircle2, XCircle, Shuffle, ShieldAlert } from 'lucide-react';

interface TruthOrDareModalProps {
  activeTod: ActiveTodState;
  canInteract: boolean;
  onSelectType: (type: TodType) => void;
  onRerollCard: () => void;
  onResolve: (completed: boolean) => void;
}

export const TruthOrDareModal: React.FC<TruthOrDareModalProps> = ({
  activeTod,
  canInteract,
  onSelectType,
  onRerollCard,
  onResolve,
}) => {
  const [isSpinningRandom, setIsSpinningRandom] = useState(false);

  const handleRandomPick = () => {
    if (!canInteract || isSpinningRandom) return;
    setIsSpinningRandom(true);
    setTimeout(() => {
      const randomChoice: TodType = Math.random() < 0.5 ? 'TRUTH' : 'DARE';
      onSelectType(randomChoice);
      setIsSpinningRandom(false);
    }, 350);
  };

  const isSnakeRescue = activeTod.triggerSource === 'SNAKE_HEAD';
  const isTruth = activeTod.selectedType === 'TRUTH';
  const snakeTail = activeTod.snakeTailTile ?? activeTod.fromTile;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 330, damping: 28 }}
        className="relative w-full max-w-lg rounded-[32px] apple-bento-card p-6 sm:p-8 text-[#F5F5F7]"
      >
        {/* Top Kicker */}
        <div className="flex items-center justify-between gap-2 text-xs font-medium mb-2.5">
          {isSnakeRescue ? (
            <div className="flex items-center gap-1.5 text-[#FF453A]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Kepala Ular #{activeTod.fromTile} · Penyelamatan DARE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#FFD60A]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Tangga Genap #{activeTod.fromTile} → Petak #{activeTod.toTile}</span>
            </div>
          )}

          <span className="font-mono-num text-[#86868B]">
            {isSnakeRescue
              ? `Ekor: #${snakeTail} · Dare: #${activeTod.toTile}`
              : activeTod.assignedMode === 'FREE_CHOICE'
              ? 'Undian: Bebas Pilih'
              : activeTod.assignedMode === 'RANDOM_TRUTH'
              ? 'Undian: Truth'
              : 'Undian: Dare'}
          </span>
        </div>

        {/* Title & Description */}
        {isSnakeRescue ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight apple-titanium-text">
              🐍 Awas Kepala Ular, {activeTod.playerName}.
            </h2>
            <p className="mt-2 text-sm text-[#86868B] leading-relaxed">
              Kamu menginjak Kepala Ular di <strong className="text-[#F5F5F7]">Petak {activeTod.fromTile}</strong>. Ambil{' '}
              <strong className="text-[#FFD60A]">Tantangan DARE</strong> agar hanya turun 1 angka ke{' '}
              <strong className="text-[#30D158]">Petak {activeTod.toTile}</strong>, atau meluncur ke ekor ular di{' '}
              <strong className="text-[#FF453A]">Petak {snakeTail}</strong>.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight apple-titanium-text">
              Giliran {activeTod.playerName}: Truth or Dare.
            </h2>
            <p className="mt-2 text-sm text-[#86868B] leading-relaxed">
              Kamu mendarat di kaki tangga genap (<strong className="text-[#F5F5F7]">Petak {activeTod.fromTile}</strong>). Selesaikan tantangan atau pertanyaan untuk mengunci posisimu di puncak tangga (<strong className="text-[#30D158]">Petak {activeTod.toTile}</strong>).
            </p>
          </>
        )}

        {/* Phase 1: Choice Unlocked */}
        {activeTod.phase === 'CHOICE_UNLOCKED' && (
          <div className="mt-6 space-y-4">
            {isSnakeRescue ? (
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl apple-subcard text-xs text-[#86868B] leading-relaxed">
                  Pilih penyelamatanmu: Lakukan <strong className="text-[#F5F5F7]">1 Tantangan DARE</strong> agar cuma mundur 1 petak (ke Petak {activeTod.toTile}), atau pasrah turun jauh ke ekor ular (Petak {snakeTail}).
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!canInteract}
                  onClick={() => onSelectType('DARE')}
                  className="w-full p-4 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm flex items-center justify-between shadow-[0_8px_24px_rgba(0,113,227,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <Flame className="w-5 h-5 text-[#FFD60A] shrink-0" />
                    <div>
                      <div className="text-base font-display font-bold">Ambil Tantangan DARE</div>
                      <div className="text-xs text-white/80">
                        Hanya turun 1 angka ke Petak {activeTod.toTile}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-num text-xs font-semibold text-white/90">
                    → #{activeTod.toTile}
                  </span>
                </motion.button>

                <button
                  type="button"
                  disabled={!canInteract}
                  onClick={() => onResolve(false)}
                  className="w-full py-3.5 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#86868B] hover:text-[#F5F5F7] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/[0.08] apple-transition disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-[#FF453A] shrink-0" />
                  <span>Pasrah Meluncur ke Ekor Ular (Petak {snakeTail})</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={!canInteract || isSpinningRandom}
                    onClick={() => onSelectType('TRUTH')}
                    className="flex flex-col items-start justify-between p-5 rounded-2xl bg-[#2997FF]/12 hover:bg-[#2997FF]/20 border border-[#2997FF]/30 text-left disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-base font-bold font-display text-[#2997FF]">Pilih TRUTH</span>
                      <HelpCircle className="w-5 h-5 text-[#2997FF]" />
                    </div>
                    <p className="text-xs text-[#86868B] leading-relaxed">
                      Jawab 1 pertanyaan jujur dari 55 koleksi kartu pasangan & LDR.
                    </p>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={!canInteract || isSpinningRandom}
                    onClick={() => onSelectType('DARE')}
                    className="flex flex-col items-start justify-between p-5 rounded-2xl bg-[#FF375F]/12 hover:bg-[#FF375F]/20 border border-[#FF375F]/30 text-left disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-base font-bold font-display text-[#FF375F]">Pilih DARE</span>
                      <Flame className="w-5 h-5 text-[#FF375F]" />
                    </div>
                    <p className="text-xs text-[#86868B] leading-relaxed">
                      Lakukan 1 aksi tantangan seru atau romantis sekarang juga.
                    </p>
                  </motion.button>
                </div>

                <button
                  type="button"
                  disabled={!canInteract || isSpinningRandom}
                  onClick={handleRandomPick}
                  className="w-full py-3.5 px-5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm flex items-center justify-center gap-2 apple-transition active:scale-97 disabled:opacity-50 cursor-pointer"
                >
                  <Shuffle className={`w-4 h-4 ${isSpinningRandom ? 'animate-spin' : ''}`} />
                  <span>{isSpinningRandom ? 'Mengundi...' : 'Pilihkan Secara Acak'}</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Phase 2: Card Revealed */}
        {activeTod.phase === 'REVEALED' && activeTod.card && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 space-y-5"
          >
            <div
              className={`rounded-2xl p-6 border ${
                isTruth
                  ? 'bg-[#2997FF]/10 border-[#2997FF]/30'
                  : 'bg-[#FF375F]/10 border-[#FF375F]/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs mb-3">
                <div className="flex items-center gap-2 font-medium">
                  {isTruth ? (
                    <HelpCircle className="w-4 h-4 text-[#2997FF]" />
                  ) : (
                    <Flame className="w-4 h-4 text-[#FF375F]" />
                  )}
                  <span className={isTruth ? 'text-[#2997FF] font-semibold' : 'text-[#FF375F] font-semibold'}>
                    {activeTod.selectedType}
                  </span>
                  <span className="text-[#86868B]">·</span>
                  <span className="text-[#86868B]">{activeTod.card.category}</span>
                </div>

                {canInteract && (
                  <button
                    type="button"
                    onClick={onRerollCard}
                    className="inline-flex items-center gap-1 text-xs text-[#2997FF] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ganti Kartu</span>
                  </button>
                )}
              </div>

              <p className="text-lg sm:text-xl font-semibold text-[#F5F5F7] leading-snug">
                “{activeTod.card.text}”
              </p>

              <p className="mt-3 text-xs text-[#FFD60A]/90">
                {isSnakeRescue
                  ? `Selesaikan Dare ini agar kamu hanya turun 1 angka ke Petak ${activeTod.toTile} (bukan ke Petak ${snakeTail}).`
                  : activeTod.card.bonusText}
              </p>
            </div>

            {canInteract && !isSnakeRescue && (
              <div className="flex items-center justify-between text-xs text-[#86868B]">
                <span>Ingin berganti jenis kartu?</span>
                <button
                  type="button"
                  onClick={() => onSelectType(isTruth ? 'DARE' : 'TRUTH')}
                  className="text-[#2997FF] hover:underline font-medium cursor-pointer"
                >
                  Beralih ke {isTruth ? 'DARE' : 'TRUTH'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={!canInteract}
                onClick={() => onResolve(true)}
                className="py-3.5 px-5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,113,227,0.35)] disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isSnakeRescue
                    ? `Selesai · Turun 1 ke #${activeTod.toTile}`
                    : `Selesai · Tetap di #${activeTod.toTile}`}
                </span>
              </motion.button>

              <button
                type="button"
                disabled={!canInteract}
                onClick={() => onResolve(false)}
                className="py-3.5 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F5F7] font-medium text-sm flex items-center justify-center gap-2 apple-transition disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <XCircle className="w-4 h-4 text-[#FF453A] shrink-0" />
                <span>
                  {isSnakeRescue
                    ? `Menyerah (Ke #${snakeTail})`
                    : `Menyerah (Ke #${activeTod.fromTile})`}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {!canInteract && (
          <p className="mt-4 text-center text-xs text-[#FFD60A]">
            Menunggu {activeTod.playerName} menyelesaikan tantangan...
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
