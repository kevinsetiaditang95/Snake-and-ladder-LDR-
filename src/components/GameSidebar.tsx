import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameMode, GameStatus, Player, GameLogEntry } from '../types/game';
import { CuteDiceRoller } from './CuteDiceRoller';
import { Avatar3D } from './Avatar3D';
import { Dices, Copy, Check, HelpCircle, Flame, ChevronRight } from 'lucide-react';

interface GameSidebarProps {
  gameMode: GameMode;
  status: GameStatus;
  activeRoomCode: string;
  copiedRoom: boolean;
  onCopyRoomCode: () => void;
  currentTurnPlayer: Player | undefined;
  diceValue: number;
  isRolling: boolean;
  isMyTurn: boolean;
  onRollDice: () => void;
  onOpenDeckModal: () => void;
  onOpenRulesModal: () => void;
  players: Player[];
  currentTurnIndex: number;
  logs: GameLogEntry[];
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  gameMode,
  status,
  activeRoomCode,
  copiedRoom,
  onCopyRoomCode,
  currentTurnPlayer,
  diceValue,
  isRolling,
  isMyTurn,
  onRollDice,
  onOpenDeckModal,
  onOpenRulesModal,
  players,
  currentTurnIndex,
  logs,
}) => {
  return (
    <div className="lg:col-span-5 xl:col-span-4 space-y-5">
      {/* Dynamic Island-Inspired Online Room Capsule */}
      {gameMode === 'ONLINE' && activeRoomCode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-3.5 rounded-full apple-bento-card flex items-center justify-between"
        >
          <div className="text-xs">
            <span className="text-[#86868B]">Kode Room: </span>
            <strong className="font-mono-num text-sm text-[#FFD60A] tracking-widest ml-1">
              {activeRoomCode}
            </strong>
          </div>
          <button
            type="button"
            onClick={onCopyRoomCode}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-[#F5F5F7] inline-flex items-center gap-1.5 apple-transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedRoom ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#30D158]" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Apple Bento Card 1: Active Turn & Dice Control */}
      <div className="rounded-[28px] apple-bento-card p-6">
        <div className="flex items-center justify-between text-xs text-[#86868B] mb-3.5">
          <span>Giliran Aktif</span>
          <span className="font-mono-num">
            {gameMode === 'LOCAL' ? 'Lokal · 1 Perangkat' : 'Online · Real-Time'}
          </span>
        </div>

        {currentTurnPlayer && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTurnPlayer.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl apple-subcard"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar3D avatar={currentTurnPlayer.avatar} size="lg" />
                <div className="min-w-0">
                  <div className="font-semibold font-display text-lg text-[#F5F5F7] truncate">
                    {currentTurnPlayer.name}
                  </div>
                  <div className="text-xs text-[#86868B] font-mono-num mt-0.5">
                    Petak {currentTurnPlayer.position} dari 100
                  </div>
                </div>
              </div>

              <CuteDiceRoller
                value={diceValue}
                isRolling={isRolling}
                playerAvatar={currentTurnPlayer.avatar}
                playerName={currentTurnPlayer.name}
                onClick={onRollDice}
                disabled={!isMyTurn || isRolling || status !== 'PLAYING'}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <motion.button
          type="button"
          whileHover={!(!isMyTurn || isRolling || status !== 'PLAYING') ? { scale: 1.015 } : {}}
          whileTap={!(!isMyTurn || isRolling || status !== 'PLAYING') ? { scale: 0.97 } : {}}
          disabled={!isMyTurn || isRolling || status !== 'PLAYING'}
          onClick={onRollDice}
          className="mt-4 w-full py-3.5 px-5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,113,227,0.35)] cursor-pointer whitespace-nowrap shrink-0"
        >
          <Dices className="w-4 h-4" />
          <span>
            {isRolling
              ? 'Mengocok Dadu...'
              : isMyTurn
              ? `Putar Dadu (${currentTurnPlayer?.name || ''})`
              : `Menunggu ${currentTurnPlayer?.name || ''}...`}
          </span>
        </motion.button>

        {/* Apple Link Strip */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onOpenDeckModal}
            className="text-[#2997FF] hover:underline inline-flex items-center gap-0.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Tambah Kartu Kustom</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenRulesModal}
            className="text-[#2997FF] hover:underline inline-flex items-center gap-0.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Panduan Petak</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Apple Bento Card 2: Players Scoreboard */}
      <div className="rounded-[28px] apple-bento-card p-6">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-semibold font-display text-[#F5F5F7]">
            Klasemen & Statistik Pemain
          </h3>
          <span className="text-xs text-[#86868B] font-mono-num">{players.length} Pemain</span>
        </div>

        <div className="space-y-2.5">
          {players.map((p, idx) => {
            const isCurrent = idx === currentTurnIndex && status !== 'GAME_OVER';
            return (
              <motion.div
                key={p.id}
                layout
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className={`p-3.5 rounded-2xl border apple-transition ${
                  isCurrent
                    ? 'bg-white/[0.08] border-[#2997FF]/60'
                    : 'bg-white/[0.03] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar3D avatar={p.avatar} size="sm" />
                    <span className="font-medium text-sm text-[#F5F5F7] truncate">{p.name}</span>
                    {isCurrent && (
                      <span className="text-[11px] font-medium text-[#2997FF]">· Aktif</span>
                    )}
                  </div>
                  <span className="font-mono-num text-xs font-semibold text-[#FFD60A] shrink-0">
                    Petak {p.position}
                  </span>
                </div>

                {/* Unboxed Metadata with middot separators */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#86868B] font-mono-num">
                  <span className="inline-flex items-center gap-1 text-[#2997FF]">
                    <HelpCircle className="w-3 h-3" />
                    Truth: {p.truthCount}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-[#FF375F]">
                    <Flame className="w-3 h-3" />
                    Dare: {p.dareCount}
                  </span>
                  <span>·</span>
                  <span>Tangga: {p.laddersClimbed}</span>
                  <span>·</span>
                  <span>Ular: {p.snakesBitten}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Apple Bento Card 3: Game Activity Log */}
      <div className="rounded-[28px] apple-bento-card p-6">
        <h3 className="text-sm font-semibold font-display text-[#F5F5F7] mb-3">
          Riwayat Permainan
        </h3>
        <div className="max-h-44 overflow-y-auto space-y-2 pr-1 text-xs">
          {logs.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-2xl apple-subcard text-[#F5F5F7]/90 leading-relaxed"
            >
              <div className="flex items-center justify-between text-[10px] text-[#86868B] font-mono-num mb-0.5">
                <span className="font-semibold" style={{ color: entry.playerColor }}>
                  {entry.playerName}
                </span>
                <span>{entry.timestamp}</span>
              </div>
              <p className="text-xs text-[#86868B]">{entry.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
