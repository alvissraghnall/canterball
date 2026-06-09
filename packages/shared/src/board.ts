import type { Piece, Ball } from './types';
import { HOME_FORMATION, AWAY_FORMATION, PIECE } from './constants';

export function createInitialPieces(): Piece[] {
  const pieces: Piece[] = [];

  HOME_FORMATION.forEach((pos, i) => {
    pieces.push({
      id: `HOME_${i}`,
      team: 'HOME',
      type: i === 0 ? 'GOALIE' : 'PLAYER',
      x: pos.x,
      y: pos.y,
    });
  });

  AWAY_FORMATION.forEach((pos, i) => {
    pieces.push({
      id: `AWAY_${i}`,
      team: 'AWAY',
      type: i === 0 ? 'GOALIE' : 'PLAYER',
      x: pos.x,
      y: pos.y,
    });
  });

  return pieces;
}

export function createInitialBall(): Ball {
  return { x: 50, y: 30 };
}
