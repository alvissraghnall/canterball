export type Team = 'HOME' | 'AWAY';

export type PieceType = 'PLAYER' | 'GOALIE';

export type GamePhase = 'IDLE' | 'PLAYER_TURN' | 'SHOT_DECLARED' | 'SHOT_IN_FLIGHT';

export type ShotResult = 'GOAL' | 'SAVE' | 'OUT';

export interface Point {
	x: number;
	y: number;
}

export interface Piece {
	id: string;
	team: Team;
	type: PieceType;
	x: number;
	y: number;
}

export interface Ball {
	x: number;
	y: number;
}

export interface GameState {
	phase: GamePhase;
	homePlayerId: string;
	awayPlayerId: string;
	homePlayerName: string;
	awayPlayerName: string;
	currentTurn: Team;
	turnNumber: number;
	pieces: Piece[];
	ball: Ball;
	score: [number, number];
	kickoffDone: boolean;
}

export interface ShotDeclaration {
	pieceId: string;
	target: Point;
	power: number;
}

export interface GoalieWindow {
	durationMs: number;
	deadline: number;
}

export interface ShotResolution {
	result: ShotResult;
	path: Point[];
	ballFinalPosition: Point;
}
