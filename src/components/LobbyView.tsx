import React from 'react';
import { motion } from 'motion/react';
import { GameMode, PLAYER_PRESETS } from '../types/game';
import { GameBoard } from './GameBoard';
import { Avatar3D } from './Avatar3D';
import { Users, Globe, Plus, Trash2, Play, ChevronRight } from 'lucide-react';

interface LobbyViewProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  localSetupPlayers: Array<{ name: string; color: string; avatar: string }>;
  setLocalSetupPlayers: React.Dispatch<
    React.SetStateAction<Array<{ name: string; color: string; avatar: string }>>
  >;
  handleStartLocalGame: () => void;
  setIsDeckModalOpen: (open: boolean) => void;
  onlinePlayerName: string;
  setOnlinePlayerName: (name: string) => void;
  onlineError: string;
  handleCreateOnlineRoom: () => void;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  handleJoinOnlineRoom: (e: React.FormEvent) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameMode,
  setGameMode,
  localSetupPlayers,
  setLocalSetupPlayers,
  handleStartLocalGame,
  setIsDeckModalOpen,
  onlinePlayerName,
  setOnlinePlayerName,
  onlineError,
  handleCreateOnlineRoom,
  roomCodeInput,
  setRoomCodeInput,
  handleJoinOnlineRoom,
}) => {
  return (
    <div className="space-y-8">
      {/* Apple Flagship Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Apple Bento Showcase & Setup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-between rounded-[32px] apple-bento-card p-7 sm:p-10"
        >
          <div>
            <div className="text-xs font-semibold tracking-wide text-[#FFD60A] mb-3">
              Edisi Pasangan LDR · Tangga Genap & Penyelamatan Kepala Ular
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight apple-titanium-text leading-[1.08]">
              Didesain untuk membuat setiap langkah makin dekat.
            </h1>

            <p className="mt-4 text-[#86868B] text-sm sm:text-base leading-relaxed max-w-2xl">
              Mainkan Ular Tangga bersama pasangan atau sahabat secara{' '}
              <strong className="text-[#F5F5F7] font-medium">Lokal (1 Perangkat)</strong> maupun{' '}
              <strong className="text-[#F5F5F7] font-medium">Online Real-Time</strong>. Setiap
              tangga genap mengaktifkan undian <strong className="text-[#F5F5F7] font-medium">Truth or Dare</strong>,
              dan setiap Kepala Ular memberimu opsi penyelamatan <strong className="text-[#F5F5F7] font-medium">Dare (-1 angka)</strong>.
            </p>

            {/* Apple iOS Segmented Mode Switcher */}
            <div className="mt-7 inline-flex items-center gap-1 p-1.5 bg-black/60 rounded-full border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setGameMode('LOCAL')}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  gameMode === 'LOCAL' ? 'text-white' : 'text-[#86868B] hover:text-[#F5F5F7]'
                }`}
              >
                {gameMode === 'LOCAL' && (
                  <motion.div
                    layoutId="appleModePill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-[#2C2C2E] border border-white/[0.12] shadow-sm"
                  />
                )}
                <Users className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Lokal (2–6 Pemain)</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('ONLINE')}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  gameMode === 'ONLINE' ? 'text-white' : 'text-[#86868B] hover:text-[#F5F5F7]'
                }`}
              >
                {gameMode === 'ONLINE' && (
                  <motion.div
                    layoutId="appleModePill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-[#2C2C2E] border border-white/[0.12] shadow-sm"
                  />
                )}
                <Globe className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Online Room Real-Time</span>
              </button>
            </div>

            {/* Setup Body */}
            {gameMode === 'LOCAL' ? (
              <motion.div
                key="local-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#86868B]">
                    Konfigurasi Pion 3D ({localSetupPlayers.length} dari 6 Pemain)
                  </h3>
                  {localSetupPlayers.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = localSetupPlayers.length;
                        const preset = PLAYER_PRESETS[nextIdx % PLAYER_PRESETS.length];
                        setLocalSetupPlayers([
                          ...localSetupPlayers,
                          {
                            name: `Pemain ${nextIdx + 1}`,
                            color: preset.color,
                            avatar: preset.avatar,
                          },
                        ]);
                      }}
                      className="text-xs font-medium text-[#2997FF] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pemain</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {localSetupPlayers.map((player, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-3 p-3 rounded-2xl apple-subcard"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...localSetupPlayers];
                          const isPig = next[idx].avatar === '🐷';
                          next[idx].avatar = isPig ? '🐍' : '🐷';
                          next[idx].color = isPig ? '#10B981' : '#EC4899';
                          setLocalSetupPlayers(next);
                        }}
                        title="Ketuk untuk mengganti figur 3D Babi atau 3D Ular"
                        className="p-0.5 rounded-full hover:scale-105 apple-transition cursor-pointer shrink-0"
                      >
                        <Avatar3D avatar={player.avatar} size="md" />
                      </button>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => {
                          const next = [...localSetupPlayers];
                          next[idx].name = e.target.value;
                          setLocalSetupPlayers(next);
                        }}
                        placeholder={`Nama Pemain ${idx + 1}`}
                        className="flex-1 min-w-0 bg-transparent text-sm font-medium text-[#F5F5F7] focus:outline-none border-b border-transparent focus:border-[#2997FF] pb-0.5"
                      />
                      {localSetupPlayers.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setLocalSetupPlayers(localSetupPlayers.filter((_, i) => i !== idx))
                          }
                          className="p-1.5 text-[#86868B] hover:text-[#FF453A] transition-colors cursor-pointer"
                          title="Hapus Pemain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleStartLocalGame}
                    className="px-6 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(0,113,227,0.4)] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Mulai Permainan</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setIsDeckModalOpen(true)}
                    className="px-4 py-3 text-[#2997FF] hover:text-[#5AC8FA] font-medium text-sm inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Jelajahi 110+ Kartu LDR</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ONLINE ROOM LOBBY FORM */
              <motion.div
                key="online-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[#86868B] mb-1.5">
                    Nama Panggilan Kamu
                  </label>
                  <input
                    type="text"
                    value={onlinePlayerName}
                    onChange={(e) => setOnlinePlayerName(e.target.value)}
                    placeholder="Masukkan namamu..."
                    className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl bg-black/60 border border-white/[0.12] text-sm text-[#F5F5F7] focus:outline-none focus:border-[#2997FF]"
                  />
                </div>

                {onlineError && (
                  <div className="p-3.5 rounded-2xl bg-[#FF453A]/15 border border-[#FF453A]/30 text-xs text-[#FF453A]">
                    {onlineError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-5 rounded-2xl apple-subcard flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F5F7]">Buat Room Baru</h4>
                      <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                        Dapatkan 5 digit kode unik untuk mengundang pasangan dari perangkatnya.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateOnlineRoom}
                      className="mt-4 w-full py-2.5 px-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs apple-transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Buat Room Online
                    </button>
                  </div>

                  <form
                    onSubmit={handleJoinOnlineRoom}
                    className="p-5 rounded-2xl apple-subcard flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F5F7]">Gabung Room</h4>
                      <input
                        type="text"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        maxLength={5}
                        placeholder="KODE 5 DIGIT"
                        className="mt-2.5 w-full px-3.5 py-2 rounded-xl bg-black/70 border border-white/[0.12] text-sm font-mono-num uppercase tracking-widest text-[#FFD60A] placeholder-[#86868B]/50 focus:outline-none focus:border-[#2997FF]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 w-full py-2.5 px-4 rounded-full bg-white/[0.1] hover:bg-white/[0.16] text-[#F5F5F7] font-semibold text-xs apple-transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Gabung Sekarang
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Unboxed Spec Footer */}
          <div className="mt-8 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs text-[#86868B]">
            <span>7 Tangga Genap Truth or Dare</span>
            <span>·</span>
            <span>8 Kepala Ular Opsi Penyelamatan Dare (-1)</span>
            <span>·</span>
            <span>110+ Kartu Anti-Duplikat</span>
          </div>
        </motion.div>

        {/* Right Column: Live Board Preview in Titanium Frame */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col justify-center"
        >
          <GameBoard
            players={localSetupPlayers.map((p, i) => ({
              id: `preview-${i}`,
              name: p.name,
              color: p.color,
              avatar: p.avatar,
              position: i === 0 ? 14 : i === 1 ? 20 : 1,
              truthCount: 0,
              dareCount: 0,
              laddersClimbed: 0,
              snakesBitten: 0,
            }))}
            currentTurnPlayerId="preview-0"
            highlightedTile={14}
          />
        </motion.div>
      </div>
    </div>
  );
};
