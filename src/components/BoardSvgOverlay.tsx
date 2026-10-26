import React from 'react';
import { LADDERS, SNAKES } from '../types/game';

/**
 * Converts board tile number (1..100) into row (0..9 from top) and col (0..9 from left)
 * in standard Snakes & Ladders Boustrophedon (zig-zag) layout:
 * Tile 1 is bottom-left (row 9, col 0).
 * Tile 10 is bottom-right (row 9, col 9).
 * Tile 11 is row 8, col 9.
 * Tile 100 is top-left (row 0, col 0).
 */
export function getTileCoordinates(tile: number): {
  row: number;
  col: number;
  xPct: number;
  yPct: number;
} {
  const zeroBased = Math.max(0, Math.min(99, tile - 1));
  const rowFromBottom = Math.floor(zeroBased / 10);
  const row = 9 - rowFromBottom;
  const colInRow = zeroBased % 10;
  const col = rowFromBottom % 2 === 0 ? colInRow : 9 - colInRow;

  const xPct = col * 10 + 5;
  const yPct = row * 10 + 5;
  return { row, col, xPct, yPct };
}

export const BoardSvgOverlay: React.FC = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    >
      <defs>
        {/* Golden Bamboo / Sunlit Vine for Even Truth-or-Dare Ladders */}
        <linearGradient id="evenLadderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Tropical Wood / Bamboo for Odd Ladders */}
        <linearGradient id="oddLadderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="50%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>

        {/* Exotic Coral & Jungle Viper Gradient for Snakes */}
        <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>
      </defs>

      {/* Render Jungle Bamboo & Golden Liana Ladders */}
      {LADDERS.map((ladder) => {
        const start = getTileCoordinates(ladder.start);
        const end = getTileCoordinates(ladder.end);
        const dx = end.xPct - start.xPct;
        const dy = end.yPct - start.yPct;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = (-dy / len) * 1.45;
        const ny = (dx / len) * 1.45;

        const isEven = ladder.start % 2 === 0;
        const strokeColor = isEven ? 'url(#evenLadderGrad)' : 'url(#oddLadderGrad)';
        const rungCount = Math.max(4, Math.floor(len / 4.0));
        const rungs = [];

        for (let i = 1; i < rungCount; i++) {
          const t = i / rungCount;
          const rx = start.xPct + dx * t;
          const ry = start.yPct + dy * t;
          rungs.push(
            <g key={i}>
              <line
                x1={rx - nx}
                y1={ry - ny}
                x2={rx + nx}
                y2={ry + ny}
                stroke="#451A03"
                strokeWidth={isEven ? '1.15' : '0.95'}
                strokeLinecap="round"
              />
              <line
                x1={rx - nx}
                y1={ry - ny}
                x2={rx + nx}
                y2={ry + ny}
                stroke={isEven ? '#FDE047' : '#86EFAC'}
                strokeWidth={isEven ? '0.65' : '0.5'}
                strokeLinecap="round"
              />
            </g>
          );
        }

        return (
          <g key={`ladder-${ladder.start}`} opacity="0.95">
            <line
              x1={start.xPct - nx}
              y1={start.yPct - ny}
              x2={end.xPct - nx}
              y2={end.yPct - ny}
              stroke="#422006"
              strokeWidth={isEven ? '1.55' : '1.25'}
              strokeLinecap="round"
            />
            <line
              x1={start.xPct + nx}
              y1={start.yPct + ny}
              x2={end.xPct + nx}
              y2={end.yPct + ny}
              stroke="#422006"
              strokeWidth={isEven ? '1.55' : '1.25'}
              strokeLinecap="round"
            />
            <line
              x1={start.xPct - nx}
              y1={start.yPct - ny}
              x2={end.xPct - nx}
              y2={end.yPct - ny}
              stroke={strokeColor}
              strokeWidth={isEven ? '0.95' : '0.75'}
              strokeLinecap="round"
            />
            <line
              x1={start.xPct + nx}
              y1={start.yPct + ny}
              x2={end.xPct + nx}
              y2={end.yPct + ny}
              stroke={strokeColor}
              strokeWidth={isEven ? '0.95' : '0.75'}
              strokeLinecap="round"
            />
            {rungs}
          </g>
        );
      })}

      {/* Render Exotic Jungle Snakes */}
      {SNAKES.map((snake) => {
        const start = getTileCoordinates(snake.start);
        const end = getTileCoordinates(snake.end);
        const midX = (start.xPct + end.xPct) / 2;
        const midY = (start.yPct + end.yPct) / 2;
        const dx = end.xPct - start.xPct;
        const dy = end.yPct - start.yPct;
        const ctrl1X = start.xPct + dx * 0.25 - dy * 0.2;
        const ctrl1Y = start.yPct + dy * 0.25 + dx * 0.2;
        const ctrl2X = start.xPct + dx * 0.75 + dy * 0.2;
        const ctrl2Y = start.yPct + dy * 0.75 - dx * 0.2;

        const pathData = `M ${start.xPct} ${start.yPct} C ${ctrl1X} ${ctrl1Y}, ${midX} ${midY}, ${end.xPct} ${end.yPct}`;

        return (
          <g key={`snake-${snake.start}`} opacity="0.94">
            <path
              d={pathData}
              fill="none"
              stroke="#4C0519"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d={pathData}
              fill="none"
              stroke="url(#snakeGrad)"
              strokeWidth="1.45"
              strokeLinecap="round"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#FEF08A"
              strokeWidth="1.0"
              strokeLinecap="round"
              strokeDasharray="1.1 1.6"
            />
            <circle
              cx={start.xPct}
              cy={start.yPct}
              r="1.9"
              fill="#E11D48"
              stroke="#FEF08A"
              strokeWidth="0.45"
            />
            <circle cx={start.xPct - 0.55} cy={start.yPct - 0.4} r="0.38" fill="#FEF08A" />
            <circle cx={start.xPct + 0.55} cy={start.yPct - 0.4} r="0.38" fill="#FEF08A" />
            <circle cx={end.xPct} cy={end.yPct} r="0.9" fill="#F43F5E" />
          </g>
        );
      })}
    </svg>
  );
};
