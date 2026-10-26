import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, LADDERS, SNAKES } from '../types/game';
import { Avatar3D, isSnakeAvatar } from './Avatar3D';
import { getTileCoordinates } from './BoardSvgOverlay';

interface BoardTokensLayerProps {
  players: Player[];
  currentTurnPlayerId: string;
}

type MoveStatus = 'IDLE' | 'HOPPING' | 'CLIMBING' | 'SLIDING';

interface TokenAnimState {
  displayTile: number;
  moveStatus: MoveStatus;
  hopTick: number;
}

/**
 * Renders 3D Pig & Snake tokens on the top z-40 layer and animates
 * tile-by-tile cute hopping, ladder climbing, and dizzy snake sliding.
 */
export const BoardTokensLayer: React.FC<BoardTokensLayerProps> = ({
  players,
  currentTurnPlayerId,
}) => {
  const [animMap, setAnimMap] = useState<Record<string, TokenAnimState>>({});
  const timersRef = useRef<Record<string, number[]>>({});

  useEffect(() => {
    players.forEach((player) => {
      const currentAnim = animMap[player.id];

      // Initialize first-time player state
      if (!currentAnim) {
        setAnimMap((prev) => ({
          ...prev,
          [player.id]: {
            displayTile: player.position,
            moveStatus: 'IDLE',
            hopTick: 0,
          },
        }));
        return;
      }

      const fromTile = currentAnim.displayTile;
      const toTile = player.position;

      if (fromTile === toTile) return;

      // Clear any pending timers for this player
      if (timersRef.current[player.id]) {
        timersRef.current[player.id].forEach((t) => window.clearTimeout(t));
      }
      timersRef.current[player.id] = [];

      // Case 1: Reset back to Tile 1
      if (toTile === 1 && fromTile > 10) {
        setAnimMap((prev) => ({
          ...prev,
          [player.id]: { displayTile: 1, moveStatus: 'IDLE', hopTick: 0 },
        }));
        return;
      }

      // Case 2: Moving backward (e.g. Snake Head Dare rescue -1 tile, or full Snake slide, or Even Ladder surrender)
      if (toTile < fromTile) {
        const isOneStepRescue = fromTile - toTile === 1;
        setAnimMap((prev) => ({
          ...prev,
          [player.id]: {
            displayTile: toTile,
            moveStatus: isOneStepRescue ? 'HOPPING' : 'SLIDING',
            hopTick: (prev[player.id]?.hopTick || 0) + 1,
          },
        }));

        const settleTimer = window.setTimeout(() => {
          setAnimMap((prev) => ({
            ...prev,
            [player.id]: {
              displayTile: toTile,
              moveStatus: 'IDLE',
              hopTick: prev[player.id]?.hopTick || 0,
            },
          }));
        }, isOneStepRescue ? 280 : 650);
        timersRef.current[player.id].push(settleTimer);
        return;
      }

      // Case 3: Moving forward (normal dice roll or ladder climb)
      const triggeredLadder = LADDERS.find(
        (l) => l.end === toTile && l.start > fromTile && l.start - fromTile <= 6
      );

      const walkTarget = triggeredLadder ? triggeredLadder.start : toTile;

      const stepTiles: number[] = [];
      if (walkTarget > fromTile && walkTarget - fromTile <= 6) {
        for (let t = fromTile + 1; t <= walkTarget; t++) {
          stepTiles.push(t);
        }
      } else {
        stepTiles.push(walkTarget);
      }

      const HOP_INTERVAL = 185; // ms per cute hop

      stepTiles.forEach((stepTile, idx) => {
        const timerId = window.setTimeout(() => {
          setAnimMap((prev) => ({
            ...prev,
            [player.id]: {
              displayTile: stepTile,
              moveStatus: 'HOPPING',
              hopTick: (prev[player.id]?.hopTick || 0) + 1,
            },
          }));
        }, idx * HOP_INTERVAL);
        timersRef.current[player.id].push(timerId);
      });

      const afterWalkDelay = stepTiles.length * HOP_INTERVAL;

      if (triggeredLadder) {
        // Climb up the ladder with a joyful celebration!
        const climbTimer = window.setTimeout(() => {
          setAnimMap((prev) => ({
            ...prev,
            [player.id]: {
              displayTile: toTile,
              moveStatus: 'CLIMBING',
              hopTick: (prev[player.id]?.hopTick || 0) + 1,
            },
          }));
        }, afterWalkDelay + 80);

        const settleTimer = window.setTimeout(() => {
          setAnimMap((prev) => ({
            ...prev,
            [player.id]: {
              displayTile: toTile,
              moveStatus: 'IDLE',
              hopTick: prev[player.id]?.hopTick || 0,
            },
          }));
        }, afterWalkDelay + 680);

        timersRef.current[player.id].push(climbTimer, settleTimer);
      } else {
        // Normal hop settle
        const settleTimer = window.setTimeout(() => {
          setAnimMap((prev) => ({
            ...prev,
            [player.id]: {
              displayTile: toTile,
              moveStatus: 'IDLE',
              hopTick: prev[player.id]?.hopTick || 0,
            },
          }));
        }, afterWalkDelay + 160);
        timersRef.current[player.id].push(settleTimer);
      }
    });
  }, [players]);

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {players.map((player) => {
        const state = animMap[player.id] || {
          displayTile: player.position,
          moveStatus: 'IDLE' as MoveStatus,
          hopTick: 0,
        };
        const { xPct, yPct } = getTileCoordinates(state.displayTile);
        const isTurn = player.id === currentTurnPlayerId;
        const isSnake = isSnakeAvatar(player.avatar);

        // Compute offset if another player is currently displayed on the exact same tile
        const sameTilePlayers = players.filter((p) => {
          const pTile = animMap[p.id]?.displayTile ?? p.position;
          return pTile === state.displayTile;
        });
        const idxInTile = sameTilePlayers.findIndex((p) => p.id === player.id);
        const offsetX =
          sameTilePlayers.length > 1
            ? (idxInTile - (sameTilePlayers.length - 1) / 2) * 14
            : 0;
        const offsetY =
          sameTilePlayers.length > 1 ? (idxInTile % 2 === 0 ? -4 : 4) : 0;

        // Cute character-specific speech bubble during hop / climb / slide
        let bubbleText = '';
        if (state.moveStatus === 'HOPPING') {
          bubbleText = isSnake ? 'Sss~ 🐍💨' : 'Boing! 🐷✨';
        } else if (state.moveStatus === 'CLIMBING') {
          bubbleText = 'Wuhu Naik! 🚀✨';
        } else if (state.moveStatus === 'SLIDING') {
          bubbleText = 'Waduh Turun! 💫';
        }

        return (
          <motion.div
            key={player.id}
            initial={false}
            animate={{
              left: `${xPct}%`,
              top: `${yPct}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: state.moveStatus === 'HOPPING' ? 320 : 160,
              damping: state.moveStatus === 'HOPPING' ? 20 : 16,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center ${
              state.moveStatus !== 'IDLE' || isTurn ? 'z-50' : 'z-40'
            }`}
          >
            <div style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}>
              {/* Cute Floating Action Speech Bubble when Moving */}
              <AnimatePresence>
                {bubbleText && (
                  <motion.div
                    key={`${state.moveStatus}-${state.hopTick}`}
                    initial={{ opacity: 0, y: 6, scale: 0.7 }}
                    animate={{ opacity: 1, y: -6, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 font-extrabold text-[9px] sm:text-[10px] shadow-lg border border-white whitespace-nowrap z-50"
                  >
                    {bubbleText}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hopping / Wiggling / Spinning 3D Figurine Wrapper */}
              <motion.div
                key={`hop-${state.hopTick}-${state.moveStatus}`}
                animate={
                  state.moveStatus === 'HOPPING'
                    ? isSnake
                      ? {
                          // Cute Snake slither-hop wiggle
                          y: [0, -18, 2, 0],
                          rotate: [0, -18, 18, 0],
                          scaleX: [1, 1.18, 0.9, 1],
                          scaleY: [1, 0.88, 1.12, 1],
                        }
                      : {
                          // Cute Pig high bouncy belly-hop
                          y: [0, -24, 3, 0],
                          rotate: [0, -12, 12, 0],
                          scaleX: [1, 0.86, 1.18, 1],
                          scaleY: [1, 1.22, 0.84, 1],
                        }
                    : state.moveStatus === 'CLIMBING'
                    ? {
                        y: [0, -30, -10, -22, 0],
                        scale: [1, 1.35, 1.15, 1.3, 1],
                        rotate: [0, -12, 12, -8, 0],
                      }
                    : state.moveStatus === 'SLIDING'
                    ? {
                        y: [0, 12, -8, 6, 0],
                        rotate: [0, -45, 45, -25, 0],
                        scale: [1, 0.8, 1.15, 0.9, 1],
                      }
                    : { y: 0, rotate: 0, scale: 1 }
                }
                transition={{
                  duration: state.moveStatus === 'HOPPING' ? 0.17 : 0.55,
                  ease: 'easeOut',
                }}
                className="flex flex-col items-center"
              >
                {/* High-Contrast Glowing Pedestal Ring */}
                <div
                  style={{ borderColor: player.color }}
                  className={`relative rounded-full p-0.5 bg-slate-950/80 border-2 shadow-[0_6px_14px_rgba(0,0,0,0.75)] backdrop-blur-[2px] ${
                    isTurn && state.moveStatus === 'IDLE'
                      ? 'ring-2 ring-amber-300 animate-bounce'
                      : ''
                  }`}
                >
                  <Avatar3D
                    avatar={player.avatar}
                    size={sameTilePlayers.length > 2 ? 'sm' : 'board'}
                  />
                </div>

                {/* Tiny Nameplate Badge under active turn player */}
                {isTurn && (
                  <span
                    style={{ backgroundColor: player.color }}
                    className="mt-0.5 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-extrabold text-white shadow-md border border-white/80 whitespace-nowrap leading-tight"
                  >
                    {player.name}
                  </span>
                )}
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
