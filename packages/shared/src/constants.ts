export const FIELD = {
  WIDTH: 100,
  HEIGHT: 60,
  GOAL_HEIGHT: 12,
  GOAL_Y: 24,
  GOAL_DEPTH: 2,
  CENTER_X: 50,
  CENTER_Y: 30,
  CENTER_RADIUS: 8,
} as const;

export const GOALIE_BOX = {
  WIDTH: 10,
  HEIGHT: 20,
  HOME_X: 0,
  HOME_Y: 20,
  AWAY_X: 90,
  AWAY_Y: 20,
} as const;

export const PIECE = {
  PLAYER_RADIUS: 1.5,
  GOALIE_RADIUS: 2.2,
  MOVE_RADIUS: 8,
  GOALIE_MOVE_RADIUS: 6,
  PLAYER_COUNT: 10,
} as const;

export const HOME_FORMATION: { x: number; y: number }[] = [
  { x: 3, y: 30 },
  { x: 10, y: 8 },
  { x: 10, y: 20 },
  { x: 10, y: 34 },
  { x: 10, y: 46 },
  { x: 25, y: 12 },
  { x: 25, y: 30 },
  { x: 25, y: 48 },
  { x: 45, y: 10 },
  { x: 45, y: 30 },
  { x: 45, y: 50 },
];

export const AWAY_FORMATION: { x: number; y: number }[] = [
  { x: 97, y: 30 },
  { x: 90, y: 8 },
  { x: 90, y: 20 },
  { x: 90, y: 34 },
  { x: 90, y: 46 },
  { x: 75, y: 12 },
  { x: 75, y: 30 },
  { x: 75, y: 48 },
  { x: 55, y: 10 },
  { x: 55, y: 30 },
  { x: 55, y: 50 },
];

export const TURN_LIMIT = 100;
export const MAX_PLAYERS_PER_ROOM = 2;
