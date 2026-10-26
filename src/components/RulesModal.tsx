import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LADDERS, SNAKES } from '../types/game';
import { X, Sparkles, ArrowUpRight, HelpCircle, Flame, Trophy } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const evenLadders = LADDERS.filter((l) => l.start % 2 === 0);
  const oddLadders = LADDERS.filter((l) => l.start % 2 !== 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 330, damping: 28 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] apple-bento-card p-6 sm:p-8 text-[#F5F5F7]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h2 className="text-xl sm:text-2xl font-bold font-display apple-titanium-text">
                Panduan Tangga Genap & Kepala Ular
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.06] text-[#86868B] hover:text-white hover:bg-white/[0.12] apple-transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-sm text-[#86868B] leading-relaxed">
              {/* Core Rule: Even Ladders */}
              <div className="p-5 rounded-2xl apple-subcard space-y-2">
                <div className="flex items-center gap-2 text-[#FFD60A] font-semibold text-base font-display">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>01. Tangga Bernomor Genap = Truth or Dare</span>
                </div>
                <p className="text-xs sm:text-sm text-[#F5F5F7]/90">
                  Setiap kali mendarat di kaki tangga pada <strong>petak bernomor genap</strong>, sistem mengaktifkan undian <strong>Truth or Dare</strong>:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 text-[#86868B] pt-1">
                  <li>
                    <strong className="text-[#F5F5F7]">Selesaikan tantangan:</strong> Pemain mengunci posisi di puncak tangga disertai efek perayaan.
                  </li>
                  <li>
                    <strong className="text-[#F5F5F7]">Menyerah:</strong> Pemain batal naik dan kembali ke kaki tangga.
                  </li>
                </ul>
              </div>

              {/* Core Rule: Snake Head Dare Rescue */}
              <div className="p-5 rounded-2xl apple-subcard space-y-2">
                <div className="flex items-center gap-2 text-[#FF375F] font-semibold text-base font-display">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span>02. Penyelamatan DARE di Kepala Ular</span>
                </div>
                <p className="text-xs sm:text-sm text-[#F5F5F7]/90">
                  Saat menginjak <strong>Kepala Ular</strong>, pemain diberi opsi penyelamatan sebelum meluncur:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 text-[#86868B] pt-1">
                  <li>
                    <strong className="text-[#F5F5F7]">Ambil & Selesaikan DARE:</strong> Selamat dari ekor ular dan <strong>hanya mundur 1 angka</strong>.
                  </li>
                  <li>
                    <strong className="text-[#F5F5F7]">Menyerah / Tolak Dare:</strong> Meluncur turun sampai ke ujung ekor ular.
                  </li>
                </ul>
              </div>

              {/* Table of Ladders & Snakes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl apple-subcard">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFD60A] mb-2.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tangga Genap (ToD)</span>
                  </div>
                  <div className="space-y-1.5 font-mono-num text-xs">
                    {evenLadders.map((l) => (
                      <div key={l.start} className="flex items-center justify-between text-[#F5F5F7]">
                        <span>Petak {l.start}</span>
                        <span className="text-[#FFD60A] font-semibold">→ #{l.end}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-subcard">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#30D158] mb-2.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Tangga Ganjil</span>
                  </div>
                  <div className="space-y-1.5 font-mono-num text-xs">
                    {oddLadders.map((l) => (
                      <div key={l.start} className="flex items-center justify-between text-[#F5F5F7]">
                        <span>Petak {l.start}</span>
                        <span className="text-[#30D158] font-semibold">→ #{l.end}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-subcard">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF453A] mb-2.5">
                    <span>🐍</span>
                    <span>Kepala Ular (Dare -1)</span>
                  </div>
                  <div className="space-y-1.5 font-mono-num text-xs">
                    {SNAKES.map((s) => (
                      <div key={s.start} className="flex items-center justify-between text-[#F5F5F7]">
                        <span>#{s.start}</span>
                        <span className="text-[#FF453A] font-semibold">Dare:{s.start - 1} / ↓{s.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multiplayer Modes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl apple-subcard">
                  <h4 className="font-semibold text-[#F5F5F7] text-sm mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#2997FF]" />
                    <span>Multiplayer Lokal</span>
                  </h4>
                  <p className="text-xs text-[#86868B]">
                    Mainkan bersama 2 hingga 6 pemain secara bergantian pada satu perangkat.
                  </p>
                </div>

                <div className="p-4 rounded-2xl apple-subcard">
                  <h4 className="font-semibold text-[#F5F5F7] text-sm mb-1 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#FF375F]" />
                    <span>Multiplayer Online</span>
                  </h4>
                  <p className="text-xs text-[#86868B]">
                    Bagikan 5 digit Kode Room untuk bermain real-time lintas perangkat.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs text-[#86868B]">
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#FFD60A]" />
                  <span>Capai tepat Petak 100 untuk memenangkan pertandingan.</span>
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs apple-transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  Selesai
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
