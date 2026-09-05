export type Team = 'HOME' | 'AWAY';

export type PieceType = 'PLAYER' | 'GOALIE';

export type GamePhase = 'IDLE' | 'PLAYER_TURN';

export type RestartKind = 'KICKOFF' | 'CORNER' | 'THROW_IN' | 'GOAL_KICK';

export interface Restart {
	kind: RestartKind;
	/** Team entitled to take the set piece (for KICKOFF, the kicking-off team). */
	team: Team;
	x: number;
	y: number;
}

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
	/** Team that last made contact with the ball; null until the ball is in play. */
	lastTouch: Team | null;
	/** Active dead-ball restart, or null while the ball is in play. */
	restart: Restart | null;
}

export interface MatchResult {
	id: string;
	room_id: string;
	home_player_id: string;
	away_player_id: string;
	home_player_name: string;
	away_player_name: string;
	winner: 'HOME' | 'AWAY' | 'DRAW';
	home_score: number;
	away_score: number;
	created_at: string;
}


