import React from 'react';
import { LADDERS, SNAKES, Player } from '../types/game';
import { Sparkles, ArrowUpRight, Flame, HelpCircle, Trophy } from 'lucide-react';
import { BoardSvgOverlay, getTileCoordinates } from './BoardSvgOverlay';
import { BoardTokensLayer } from './BoardTokensLayer';

interface GameBoardProps {
  players: Player[];
  currentTurnPlayerId: string;
  highlightedTile: number | null;
}

// Vibrant Tropical Jungle Wilderness Palette for normal tiles
const JUNGLE_TILE_PALETTE = [
  { bg: 'bg-[#D9F99D]', border: 'border-[#84CC16]/60', text: 'text-[#1A2E05]', deco: '🌿' },
  { bg: 'bg-[#A7F3D0]', border: 'border-[#10B981]/60', text: 'text-[#064E3B]', deco: '🍃' },
  { bg: 'bg-[#FDE68A]', border: 'border-[#F59E0B]/60', text: 'text-[#451A03]', deco: '🌻' },
  { bg: 'bg-[#99F6E4]', border: 'border-[#14B8A6]/60', text: 'text-[#134E4A]', deco: '💧' },
  { bg: 'bg-[#BBF7D0]', border: 'border-[#22C55E]/60', text: 'text-[#14532D]', deco: '🌴' },
  { bg: 'bg-[#FED7AA]', border: 'border-[#F97316]/60', text: 'text-[#431407]', deco: '🍄' },
];

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentTurnPlayerId,
  highlightedTile,
}) => {
  // Generate 100 cells ordered from top-left (row 0, col 0 -> tile 100) to bottom-right (row 9, col 9 -> tile 10)
  const cells: number[] = [];
  for (let r = 0; r < 10; r++) {
    const rowFromBottom = 9 - r;
    const base = rowFromBottom * 10;
    const rowTiles: number[] = [];
    for (let c = 1; c <= 10; c++) {
      rowTiles.push(base + c);
    }
    if (rowFromBottom % 2 === 1) {
      rowTiles.reverse();
    }
    cells.push(...rowTiles);
  }

  return (
    <div className="relative w-full aspect-square max-w-[690px] mx-auto rounded-[32px] p-3 sm:p-4 bg-gradient-to-b from-[#2C2C2E] via-[#1C1C1E] to-[#111113] border border-white/[0.16] shadow-[0_32px_90px_rgba(0,0,0,0.85)] select-none overflow-hidden">
      {/* Inner Super Retina XDR Jungle Display Container */}
      <div className="relative w-full h-full rounded-[22px] overflow-hidden border border-white/20 bg-[#14532D] shadow-inner">
        {/* Layer 1: 10x10 Colorful Jungle Wilderness Grid */}
        <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
          {cells.map((tile) => {
            const evenLadder = LADDERS.find((l) => l.start === tile && l.start % 2 === 0);
            const oddLadder = LADDERS.find((l) => l.start === tile && l.start % 2 !== 0);
            const snakeHead = SNAKES.find((s) => s.start === tile);
            const isFinish = tile === 100;
            const isStart = tile === 1;
            const isHighlighted = highlightedTile === tile;

            const { row, col } = getTileCoordinates(tile);
            const paletteIndex = (row * 3 + col * 2 + tile) % JUNGLE_TILE_PALETTE.length;
            const jungleTile = JUNGLE_TILE_PALETTE[paletteIndex];

            let bgClass = `${jungleTile.bg} ${jungleTile.border}`;
            if (isFinish) {
              bgClass =
                'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 border-amber-600 ring-2 ring-inset ring-yellow-100';
            } else if (evenLadder) {
              bgClass =
                'bg-gradient-to-br from-[#FEF08A] via-[#FDE047] to-[#FBBF24] border-amber-600 ring-2 ring-inset ring-amber-500/90 shadow-inner';
            } else if (oddLadder) {
              bgClass =
                'bg-gradient-to-br from-[#6EE7B7] to-[#34D399] border-emerald-700 ring-1 ring-inset ring-emerald-600';
            } else if (snakeHead) {
              bgClass =
                'bg-gradient-to-br from-[#FECDD3] via-[#FDA4AF] to-[#FB7185] border-rose-700 ring-1 ring-inset ring-rose-500';
            } else if (isStart) {
              bgClass =
                'bg-gradient-to-br from-[#A7F3D0] via-[#6EE7B7] to-[#34D399] border-emerald-700';
            }

            const hasPlayersOnTile = players.some((p) => p.position === tile);
            const showJungleFlora =
              !evenLadder && !oddLadder && !snakeHead && !isFinish && !isStart && tile % 3 === 0;

            return (
              <div
                key={tile}
                className={`relative flex flex-col justify-between p-1 sm:p-1.5 border apple-transition ${bgClass} ${
                  isHighlighted ? 'ring-4 ring-inset ring-white scale-[1.03] z-10' : ''
                }`}
              >
                {/* Top Row: Tile Number & Special Indicator */}
                <div className="flex items-start justify-between w-full leading-none z-10">
                  <span
                    className={`font-mono-num text-[10px] sm:text-xs font-extrabold tracking-tighter drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] ${
                      isFinish
                        ? 'text-amber-950 text-xs sm:text-sm'
                        : evenLadder
                        ? 'text-amber-950'
                        : snakeHead
                        ? 'text-rose-950'
                        : oddLadder
                        ? 'text-emerald-950'
                        : jungleTile.text
                    }`}
                  >
                    {tile}
                  </span>

                  {evenLadder && (
                    <span
                      title={`Tangga Genap Hutan #${tile} → ${evenLadder.end} (Truth or Dare!)`}
                      className="inline-flex items-center gap-0.5 text-[8px] sm:text-[10px] font-extrabold text-amber-950 bg-amber-300/80 px-1 rounded"
                    >
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-800 shrink-0" />
                      <span className="hidden sm:inline">ToD</span>
                    </span>
                  )}

                  {oddLadder && (
                    <span
                      title={`Tangga Bambu #${tile} → ${oddLadder.end}`}
                      className="text-[9px] font-extrabold text-emerald-950 hidden sm:inline"
                    >
                      ↑{oddLadder.end}
                    </span>
                  )}

                  {snakeHead && (
                    <span
                      title={`Kepala Ular #${tile}: Ambil DARE (turun 1 ke #${tile - 1}) atau meluncur ke #${snakeHead.end}`}
                      className="text-[9px] font-extrabold text-rose-950 hidden sm:inline"
                    >
                      ↓{snakeHead.end}
                    </span>
                  )}

                  {isFinish && (
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-950 shrink-0" />
                  )}
                </div>

                {/* Subtle Jungle Flora Watermark on Normal Tiles */}
                {showJungleFlora && !hasPlayersOnTile && (
                  <span className="text-[10px] sm:text-xs opacity-45 self-end mt-auto select-none pointer-events-none leading-none">
                    {jungleTile.deco}
                  </span>
                )}

                {/* Center Marker for Even Ladders */}
                {evenLadder && !hasPlayersOnTile && (
                  <div className="my-auto flex items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-extrabold text-amber-950 bg-white/75 px-1 py-0.5 rounded shadow-xs">
                      <HelpCircle className="w-2.5 h-2.5 text-sky-700" />
                      <span>/</span>
                      <Flame className="w-2.5 h-2.5 text-rose-700" />
                    </div>
                  </div>
                )}

                {isStart && !hasPlayersOnTile && (
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-950 uppercase tracking-wider self-center bg-white/60 px-1 rounded">
                    🏕️ Start
                  </span>
                )}

                {/* Bottom Destination Hint for Even Ladder */}
                {evenLadder && (
                  <div className="flex items-center justify-end text-[8px] sm:text-[9px] font-mono-num font-extrabold text-amber-950 leading-none z-10">
                    <span>→{evenLadder.end}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Layer 2: SVG Overlay for Bamboo Ladders, Golden Liana Ladders & Jungle Vipers (z-20) */}
        <BoardSvgOverlay />

        {/* Layer 3: Animated 3D Pig & Snake Figurines (z-40, hops tile-by-tile) */}
        <BoardTokensLayer
          players={players}
          currentTurnPlayerId={currentTurnPlayerId}
        />
      </div>

      {/* Apple Titanium Bezel Legend Strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-[#86868B]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1 font-medium text-[#FFD60A]">
            <Sparkles className="w-3 h-3" />
            <span>Tangga Genap (4, 14, 20, 28, 36, 62, 80) = Truth / Dare</span>
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 font-medium text-[#30D158]">
            <ArrowUpRight className="w-3 h-3" />
            <span>Tangga Ganjil = Naik Bebas</span>
          </span>
        </div>
        <span className="text-[#FF453A] font-medium">🐍 Kepala Ular = Dare (-1) / Meluncur</span>
      </div>
    </div>
  );
};
