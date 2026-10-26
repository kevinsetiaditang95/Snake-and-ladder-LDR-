import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TodCard, TodType } from '../types/game';
import { X, Plus, HelpCircle, Flame } from 'lucide-react';

interface CustomDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: TodCard[];
  onAddCard: (type: TodType, text: string) => void;
}

export const CustomDeckModal: React.FC<CustomDeckModalProps> = ({
  isOpen,
  onClose,
  cards,
  onAddCard,
}) => {
  const [selectedType, setSelectedType] = useState<TodType>('TRUTH');
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'TRUTH' | 'DARE'>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5) return;
    onAddCard(selectedType, text.trim());
    setText('');
  };

  const filteredCards = cards.filter((c) => (filter === 'ALL' ? true : c.type === filter));

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
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[32px] apple-bento-card p-6 sm:p-8 text-[#F5F5F7]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display apple-titanium-text">
                  Koleksi Kartu Truth & Dare
                </h2>
                <p className="text-xs text-[#86868B] mt-0.5">
                  110+ kartu pasangan LDR dengan sistem anti-duplikat otomatis. Tambahkan kartumu sendiri.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.06] text-[#86868B] hover:text-white hover:bg-white/[0.12] apple-transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Custom Card Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-3 p-4 rounded-2xl apple-subcard">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#86868B]">Buat Kartu Baru</span>
                <div className="flex items-center gap-1 p-1 bg-black/60 rounded-full border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setSelectedType('TRUTH')}
                    className={`px-3.5 py-1 text-xs font-medium rounded-full apple-transition cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedType === 'TRUTH'
                        ? 'bg-[#2997FF] text-white'
                        : 'text-[#86868B] hover:text-white'
                    }`}
                  >
                    Truth (Pertanyaan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('DARE')}
                    className={`px-3.5 py-1 text-xs font-medium rounded-full apple-transition cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedType === 'DARE'
                        ? 'bg-[#FF375F] text-white'
                        : 'text-[#86868B] hover:text-white'
                    }`}
                  >
                    Dare (Tantangan)
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    selectedType === 'TRUTH'
                      ? 'Contoh: Hal apa yang paling kamu rindukan dariku malam ini?'
                      : 'Contoh: Kirim voice note bilang sayang dan nyanyikan 1 bait lagu cinta!'
                  }
                  className="flex-1 px-4 py-2.5 rounded-full bg-black/60 border border-white/[0.12] text-sm text-[#F5F5F7] placeholder-[#86868B]/60 focus:outline-none focus:border-[#2997FF]"
                />
                <button
                  type="submit"
                  disabled={text.trim().length < 5}
                  className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-40 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 apple-transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Kartu</span>
                </button>
              </div>
            </form>

            {/* Filter Tabs */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 p-1 bg-black/60 rounded-full border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full apple-transition cursor-pointer whitespace-nowrap shrink-0 ${
                    filter === 'ALL' ? 'bg-[#2C2C2E] text-white' : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  Semua ({cards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('TRUTH')}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full apple-transition cursor-pointer whitespace-nowrap shrink-0 ${
                    filter === 'TRUTH' ? 'bg-[#2997FF]/20 text-[#2997FF]' : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  Truth ({cards.filter((c) => c.type === 'TRUTH').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('DARE')}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full apple-transition cursor-pointer whitespace-nowrap shrink-0 ${
                    filter === 'DARE' ? 'bg-[#FF375F]/20 text-[#FF375F]' : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  Dare ({cards.filter((c) => c.type === 'DARE').length})
                </button>
              </div>
            </div>

            {/* Card List */}
            <div className="mt-3.5 flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl apple-subcard flex items-start gap-3"
                >
                  {card.type === 'TRUTH' ? (
                    <HelpCircle className="w-4 h-4 text-[#2997FF] shrink-0 mt-0.5" />
                  ) : (
                    <Flame className="w-4 h-4 text-[#FF375F] shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#86868B]">
                      <span className={card.type === 'TRUTH' ? 'text-[#2997FF] font-semibold' : 'text-[#FF375F] font-semibold'}>
                        {card.type}
                      </span>
                      <span>·</span>
                      <span>{card.category}</span>
                    </div>
                    <p className="text-sm text-[#F5F5F7] mt-1 leading-relaxed">{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
