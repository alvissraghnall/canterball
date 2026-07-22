import type { GameState, Team } from './types';

export interface ClientMessage {
	type: 'JOIN_ROOM';
	roomId: string;
	playerName: string;
}

export interface ClientMovePiece {
	type: 'MOVE_PIECE';
	pieceId: string;
	targetX: number;
	targetY: number;
}

export type ClientInMessage = ClientMessage | ClientMovePiece;

export interface ServerRoomJoined {
	type: 'ROOM_JOINED';
	roomId: string;
	playerId: string;
	playerSide: Team;
	playerCount: number;
}

export interface ServerStateUpdate {
	type: 'STATE_UPDATE';
	state: GameState;
}

export interface ServerGameOver {
	type: 'GAME_OVER';
	winner: Team | 'DRAW';
	score: [number, number];
}

export interface ServerError {
	type: 'ERROR';
	message: string;
}

export interface ServerPlayerJoined {
	type: 'PLAYER_JOINED';
	playerName: string;
	side: Team;
	playerCount: number;
}

export interface ServerOpponentDisconnected {
	type: 'OPPONENT_DISCONNECTED';
}

export type ServerOutMessage =
	| ServerRoomJoined
	| ServerStateUpdate
	| ServerGameOver
	| ServerError
	| ServerPlayerJoined
	| ServerOpponentDisconnected;
