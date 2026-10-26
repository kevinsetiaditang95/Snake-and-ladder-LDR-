import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar3D } from './Avatar3D';

interface CuteDiceRollerProps {
  value: number;
  isRolling: boolean;
  playerAvatar?: string;
  playerName?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const DOT_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export const CuteDiceRoller: React.FC<CuteDiceRollerProps> = ({
  value,
  isRolling,
  playerAvatar = '🐷',
  playerName = 'Pemain',
  onClick,
  disabled = false,
}) => {
  const activeDots = DOT_POSITIONS[value] || DOT_POSITIONS[6];

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Apple Glassmorphic Overlay with Cute 3D Mascots during Dice Roll */}
      <AnimatePresence>
        {isRolling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/65 backdrop-blur-xl"
          >
            <div className="relative flex flex-col items-center p-8 sm:p-10 rounded-[36px] apple-bento-card">
              {/* Bouncing 3D Character Mascots (3D Pig & 3D Snake cheering!) */}
              <div className="flex items-center gap-8 mb-5">
                <motion.div
                  animate={{
                    y: [0, -18, 0],
                    rotate: [-14, 14, -14],
                    scale: [1, 1.18, 1],
                  }}
                  transition={{ duration: 0.35, repeat: Infinity }}
                >
                  <Avatar3D avatar="🐷" size="xl" />
                </motion.div>

                {/* Big Cute Rolling Die with Kawaii Face */}
                <motion.div
                  animate={{
                    rotate: [0, -25, 25, -20, 20, 360],
                    y: [0, -26, 6, -16, 0],
                    scale: [1, 1.16, 0.92, 1.12, 1],
                  }}
                  transition={{
                    duration: 0.45,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[26px] bg-gradient-to-br from-[#FFF3B0] via-[#FFD60A] to-[#F59E0B] border-2 border-white/90 shadow-[0_20px_50px_rgba(255,214,10,0.35)] flex flex-col items-center justify-center p-3"
                >
                  <div className="flex items-center justify-between w-full px-2 mb-1">
                    <span className="text-slate-950 font-extrabold text-sm leading-none">✦</span>
                    <span className="text-xs font-bold text-rose-600 leading-none">ω</span>
                    <span className="text-slate-950 font-extrabold text-sm leading-none">✦</span>
                  </div>

                  <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-14 h-14 bg-white/45 rounded-xl p-1.5">
                    {Array.from({ length: 9 }).map((_, idx) => {
                      const hasDot = activeDots.includes(idx);
                      return (
                        <div key={idx} className="flex items-center justify-center">
                          {hasDot && (
                            <span
                              className={`block rounded-full ${
                                value === 1
                                  ? 'w-3.5 h-3.5 bg-rose-600'
                                  : 'w-2.5 h-2.5 bg-slate-950'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -18, 0],
                    rotate: [14, -14, 14],
                    scale: [1, 1.18, 1],
                  }}
                  transition={{ duration: 0.35, repeat: Infinity, delay: 0.1 }}
                >
                  <Avatar3D avatar="🐍" size="xl" />
                </motion.div>
              </div>

              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 0.35, repeat: Infinity }}
                className="flex items-center gap-2.5 text-base sm:text-lg font-bold font-display text-[#F5F5F7] tracking-tight text-center"
              >
                <Avatar3D avatar={playerAvatar} size="sm" />
                <span>{playerName} sedang memutar dadu...</span>
              </motion.div>
              <span className="text-xs text-[#86868B] mt-1">
                Menentukan langkah berikutnya di papan permainan
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Interactive Tactile Die in the HUD */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onClick}
        whileHover={!disabled ? { scale: 1.07, rotate: 5 } : {}}
        whileTap={!disabled ? { scale: 0.92, rotate: -8 } : {}}
        animate={
          isRolling
            ? {
                rotate: [0, -20, 20, -15, 15, 0],
                y: [0, -10, 4, -6, 0],
                scale: [1, 1.14, 0.92, 1.08, 1],
              }
            : { rotate: 0, y: 0, scale: 1 }
        }
        transition={{ duration: 0.35 }}
        title="Ketuk untuk memutar dadu"
        className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFF3B0] via-[#FFD60A] to-[#F59E0B] border border-white/80 shadow-[0_8px_24px_rgba(255,214,10,0.25)] flex flex-col items-center justify-center p-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
      >
        <div className="flex items-center justify-between w-full px-1 mb-0.5 leading-none">
          <span className="w-1.5 h-1 rounded-full bg-rose-400/80" />
          <span className="text-[9px] font-bold text-slate-900 leading-none">
            {isRolling ? '≧◡≦' : '•ᴗ•'}
          </span>
          <span className="w-1.5 h-1 rounded-full bg-rose-400/80" />
        </div>

        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-10 h-10 bg-white/55 rounded-lg p-1">
          {Array.from({ length: 9 }).map((_, idx) => {
            const hasDot = activeDots.includes(idx);
            return (
              <div key={idx} className="flex items-center justify-center">
                {hasDot && (
                  <span
                    className={`block rounded-full ${
                      value === 1 && idx === 4
                        ? 'w-2.5 h-2.5 bg-rose-600'
                        : 'w-2 h-2 bg-slate-950'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </motion.button>
    </div>
  );
};
