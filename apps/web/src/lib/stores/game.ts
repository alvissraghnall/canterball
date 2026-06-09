import { writable, derived } from 'svelte/store';
import type { GameState, Team } from '@canterball/shared';

export const connection = writable<WebSocket | null>(null);
export const gameState = writable<GameState | null>(null);
export const playerId = writable<string | null>(null);
export const playerSide = writable<Team | null>(null);
export const playerName = writable<string>('');
export const phase = writable<'lobby' | 'playing' | 'finished'>('lobby');
export const shotPath = writable<{ x: number; y: number }[]>([]);
export const shotAnimating = writable(false);
export const goalieWindowActive = writable(false);
export const errorMessage = writable<string | null>(null);

export const isMyTurn = derived(
  [gameState, playerSide],
  ([$gameState, $playerSide]) => {
    if (!$gameState || !$playerSide) return false;
    return $gameState.currentTurn === $playerSide;
  },
);

export const myTeamPieces = derived(
  [gameState, playerSide],
  ([$gameState, $playerSide]) => {
    if (!$gameState || !$playerSide) return [];
    return $gameState.pieces.filter((p) => p.team === $playerSide);
  },
);

export const opponentPieces = derived(
  [gameState, playerSide],
  ([$gameState, $playerSide]) => {
    if (!$gameState || !$playerSide) return [];
    const opp: Team = $playerSide === 'HOME' ? 'AWAY' : 'HOME';
    return $gameState.pieces.filter((p) => p.team === opp);
  },
);

export function resetStores(): void {
  gameState.set(null);
  playerId.set(null);
  playerSide.set(null);
  phase.set('lobby');
  shotPath.set([]);
  shotAnimating.set(false);
  goalieWindowActive.set(false);
  errorMessage.set(null);
}
