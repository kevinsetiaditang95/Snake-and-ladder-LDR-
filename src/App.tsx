import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_TOD_CARDS } from './types/game';
import { GameBoard } from './components/GameBoard';
import { LobbyView } from './components/LobbyView';
import { GameSidebar } from './components/GameSidebar';
import { TruthOrDareModal } from './components/TruthOrDareModal';
import { CustomDeckModal } from './components/CustomDeckModal';
import { RulesModal } from './components/RulesModal';
import { Avatar3D } from './components/Avatar3D';
import { useGameController } from './hooks/useGameController';
import { soundFX } from './utils/sound';
import { Volume2, VolumeX, RotateCcw, Trophy } from 'lucide-react';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);

  const game = useGameController();

  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  const currentTurnPlayer = game.players[game.currentTurnIndex];
  const isMyTurn =
    game.gameMode === 'LOCAL' ||
    (game.gameMode === 'ONLINE' && currentTurnPlayer?.id === game.myPlayerId);
  const canInteractWithTod =
    game.gameMode === 'LOCAL' ||
    (game.gameMode === 'ONLINE' && game.activeTod?.playerId === game.myPlayerId);

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#F5F5F7] selection:bg-[#0071E3] selection:text-white relative overflow-x-hidden">
      {/* Subtle Apple Keynote Ambient Backlight */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full bg-[#0071E3]/[0.08] blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[650px] h-[360px] rounded-full bg-[#FFD60A]/[0.05] blur-[140px]" />
      </div>

      {/* Apple Global Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-white/[0.08] apple-glass-nav">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            game.setStatus('TITLE_MENU');
          }}
          className="text-base sm:text-lg font-semibold font-display tracking-tight text-[#F5F5F7] hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Ular Tangga Pro
        </a>

        <nav className="hidden md:flex items-center gap-7 text-xs font-normal text-[#86868B]">
          <button
            type="button"
            onClick={() => game.setStatus('TITLE_MENU')}
            className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ringkasan
          </button>
          <button
            type="button"
            onClick={() => setIsDeckModalOpen(true)}
            className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Koleksi Kartu ({DEFAULT_TOD_CARDS.length + game.customCards.length})
          </button>
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Aturan Tangga & Ular
          </button>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Audio Aktif' : 'Audio Bisu'}</span>
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {game.status === 'TITLE_MENU' ? (
            <button
              type="button"
              onClick={game.handleStartLocalGame}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-full apple-transition active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Main Sekarang
            </button>
          ) : (
            <button
              type="button"
              onClick={game.handleResetGame}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-full apple-transition active:scale-95 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mulai Ulang</span>
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {game.status === 'TITLE_MENU' ? (
            <motion.div
              key="lobby-view"
              initial={{ opacity: 0, y: 20, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <LobbyView
                gameMode={game.gameMode}
                setGameMode={game.setGameMode}
                localSetupPlayers={game.localSetupPlayers}
                setLocalSetupPlayers={game.setLocalSetupPlayers}
                handleStartLocalGame={game.handleStartLocalGame}
                setIsDeckModalOpen={setIsDeckModalOpen}
                onlinePlayerName={game.onlinePlayerName}
                setOnlinePlayerName={game.setOnlinePlayerName}
                onlineError={game.onlineError}
                handleCreateOnlineRoom={game.handleCreateOnlineRoom}
                roomCodeInput={game.roomCodeInput}
                setRoomCodeInput={game.setRoomCodeInput}
                handleJoinOnlineRoom={game.handleJoinOnlineRoom}
              />
            </motion.div>
          ) : (
            <motion.div
              key="game-view"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start"
            >
              <div className="lg:col-span-7 xl:col-span-8">
                <GameBoard
                  players={game.players}
                  currentTurnPlayerId={currentTurnPlayer?.id || ''}
                  highlightedTile={game.highlightedTile}
                />
              </div>

              <GameSidebar
                gameMode={game.gameMode}
                status={game.status}
                activeRoomCode={game.activeRoomCode}
                copiedRoom={game.copiedRoom}
                onCopyRoomCode={game.handleCopyRoomCode}
                currentTurnPlayer={currentTurnPlayer}
                diceValue={game.diceValue}
                isRolling={game.isRolling}
                isMyTurn={isMyTurn}
                onRollDice={game.handleRollDice}
                onOpenDeckModal={() => setIsDeckModalOpen(true)}
                onOpenRulesModal={() => setIsRulesModalOpen(true)}
                players={game.players}
                currentTurnIndex={game.currentTurnIndex}
                logs={game.logs}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {game.status === 'TRUTH_OR_DARE' && game.activeTod && (
        <TruthOrDareModal
          activeTod={game.activeTod}
          canInteract={canInteractWithTod}
          onSelectType={game.handleSelectTodType}
          onRerollCard={game.handleRerollTodCard}
          onResolve={game.handleResolveTod}
        />
      )}

      <AnimatePresence>
        {game.status === 'GAME_OVER' && game.winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-md rounded-[28px] apple-bento-card p-8 text-center"
            >
              <div className="flex items-center justify-center mx-auto mb-5">
                <Avatar3D avatar={game.winner.avatar} size="xl" />
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFD60A] mb-1.5">
                <Trophy className="w-4 h-4" />
                <span>Pemenang Petak 100</span>
              </div>
              <h2 className="text-3xl font-bold font-display apple-titanium-text">
                Selamat, {game.winner.name}.
              </h2>
              <p className="mt-2.5 text-sm text-[#86868B] leading-relaxed">
                Berhasil mencapai puncak petak 100 dengan menuntaskan{' '}
                <strong className="text-[#2997FF]">{game.winner.truthCount} Truth</strong> dan{' '}
                <strong className="text-[#FF375F]">{game.winner.dareCount} Dare</strong>.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={game.handleResetGame}
                  className="flex-1 py-3 px-5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm apple-transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Main Lagi
                </button>
                <button
                  type="button"
                  onClick={() => game.setStatus('TITLE_MENU')}
                  className="py-3 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F5F7] font-medium text-sm apple-transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Menu Utama
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomDeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        cards={[...game.customCards, ...DEFAULT_TOD_CARDS]}
        onAddCard={game.handleAddCustomCard}
      />

      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
    </div>
  );
}
