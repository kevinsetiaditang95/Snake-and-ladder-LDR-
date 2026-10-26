import { TRUTH_CARDS_DECK } from './todTruthDeck';
import { DARE_CARDS_DECK } from './todDareDeck';

export type GameMode = 'LOCAL' | 'ONLINE';
export type GameStatus = 'TITLE_MENU' | 'PLAYING' | 'TRUTH_OR_DARE' | 'GAME_OVER';
export type TodType = 'TRUTH' | 'DARE';
export type TodPhase = 'SPINNING' | 'CHOICE_UNLOCKED' | 'REVEALED';

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
  position: number; // 1 to 100
  truthCount: number;
  dareCount: number;
  laddersClimbed: number;
  snakesBitten: number;
  connected?: boolean;
}

export interface LadderOrSnake {
  start: number;
  end: number;
  isEvenLadder?: boolean; // true if start < end and start % 2 === 0
}

export interface TodCard {
  id: string;
  type: TodType;
  category: 'Kangen & Romantis' | 'Deep Talk LDR' | 'Kocak & Gemas' | 'Tantangan Virtual' | 'Seru';
  text: string;
  bonusText: string;
}

export interface ActiveTodState {
  playerId: string;
  playerName: string;
  fromTile: number;
  toTile: number;
  triggerSource?: 'EVEN_LADDER' | 'SNAKE_HEAD';
  snakeTailTile?: number;
  phase: TodPhase;
  assignedMode: 'RANDOM_TRUTH' | 'RANDOM_DARE' | 'FREE_CHOICE';
  selectedType: TodType | null;
  card: TodCard | null;
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  playerName: string;
  playerColor: string;
  message: string;
  type: 'MOVE' | 'LADDER_EVEN' | 'LADDER_ODD' | 'SNAKE' | 'TOD_COMPLETE' | 'TOD_SKIP' | 'WIN';
}

export interface RoomState {
  roomId: string;
  mode: GameMode;
  status: GameStatus;
  players: Player[];
  currentTurnIndex: number;
  diceValue: number;
  isRolling: boolean;
  activeTod: ActiveTodState | null;
  winner: Player | null;
  logs: GameLogEntry[];
  customCards: TodCard[];
  usedCardIds?: string[];
}

export const LADDERS: LadderOrSnake[] = [
  { start: 4, end: 25, isEvenLadder: true },
  { start: 9, end: 31, isEvenLadder: false },
  { start: 14, end: 35, isEvenLadder: true },
  { start: 20, end: 42, isEvenLadder: true },
  { start: 28, end: 84, isEvenLadder: true },
  { start: 36, end: 57, isEvenLadder: true },
  { start: 51, end: 67, isEvenLadder: false },
  { start: 62, end: 81, isEvenLadder: true },
  { start: 71, end: 91, isEvenLadder: false },
  { start: 80, end: 98, isEvenLadder: true },
];

export const SNAKES: LadderOrSnake[] = [
  { start: 17, end: 7 },
  { start: 47, end: 26 },
  { start: 54, end: 34 },
  { start: 64, end: 60 },
  { start: 87, end: 24 },
  { start: 93, end: 73 },
  { start: 95, end: 75 },
  { start: 99, end: 78 },
];

export const PLAYER_PRESETS = [
  { color: '#EC4899', label: 'Babi Pink', avatar: '🐷' },
  { color: '#10B981', label: 'Ular Zamrud', avatar: '🐍' },
  { color: '#F43F5E', label: 'Babi Mungil', avatar: '🐽' },
  { color: '#059669', label: 'Ular Rimba', avatar: '🐍' },
  { color: '#A855F7', label: 'Babi Ungu', avatar: '🐖' },
  { color: '#3B82F6', label: 'Ular Samudra', avatar: '🐍' },
];

export const DEFAULT_TOD_CARDS: TodCard[] = [
  ...TRUTH_CARDS_DECK,
  ...DARE_CARDS_DECK,
];

/**
 * Picks a random Truth or Dare card without repeating already-drawn cards
 * until all cards of that type have been played (auto-reshuffle).
 */
export function drawUniqueTodCard(
  customCards: TodCard[],
  usedCardIds: string[],
  type: TodType,
  excludeCardId?: string
): { card: TodCard; nextUsedIds: string[] } {
  const allOfType = [...DEFAULT_TOD_CARDS, ...customCards].filter((c) => c.type === type);
  let unseenPool = allOfType.filter((c) => !usedCardIds.includes(c.id) && c.id !== excludeCardId);

  let updatedUsed = [...usedCardIds];
  if (unseenPool.length === 0) {
    // All cards of this type have been seen! Reset used history for this type so deck reshuffles
    const idsOfType = new Set(allOfType.map((c) => c.id));
    updatedUsed = updatedUsed.filter((id) => !idsOfType.has(id));
    unseenPool = allOfType.filter((c) => c.id !== excludeCardId);
    if (unseenPool.length === 0) unseenPool = allOfType;
  }

  const chosen = unseenPool[Math.floor(Math.random() * unseenPool.length)] || DEFAULT_TOD_CARDS[0];
  if (!updatedUsed.includes(chosen.id)) {
    updatedUsed.push(chosen.id);
  }
  return { card: chosen, nextUsedIds: updatedUsed };
}
