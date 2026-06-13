import {
	type Piece,
	type Ball,
	type GameState,
	type Point,
	type Team,
	FIELD,
	PIECE,
	TURN_LIMIT,
	createInitialPieces,
	createInitialBall,
} from '@canterball/shared';

import { checkBallHit } from './physics';

function dist(a: Point, b: Point): number {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function clamp(v: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, v));
}

export class GameStateMachine {
	state: GameState;

	constructor(homeId: string, homeName: string, awayId: string, awayName: string) {
		this.state = {
			phase: 'PLAYER_TURN',
			homePlayerId: homeId,
			awayPlayerId: awayId,
			homePlayerName: homeName,
			awayPlayerName: awayName,
			currentTurn: 'HOME',
			turnNumber: 1,
			pieces: createInitialPieces(),
			ball: createInitialBall(),
			score: [0, 0],
			kickoffDone: false,
		};
		this.setupKickoff();
	}

	private setupKickoff(): void {
		this.state.ball = { x: FIELD.CENTER_X, y: FIELD.CENTER_Y };
		this.state.kickoffDone = false;

		// Position a central piece over the ball for kickoff
		const strikerId = `${this.state.currentTurn}_10`;
		const striker = this.state.pieces.find((p) => p.id === strikerId);
		if (striker) {
			striker.x = FIELD.CENTER_X;
			striker.y = FIELD.CENTER_Y;
		}
	}

	getPiecesForTeam(team: Team): Piece[] {
		return this.state.pieces.filter((p) => p.team === team);
	}

	getGoalie(team: Team): Piece | undefined {
		return this.state.pieces.find((p) => p.team === team && p.type === 'GOALIE');
	}

	canMovePiece(
		pieceId: string,
		targetX: number,
		targetY: number,
	): { valid: boolean; reason?: string } {
		const state = this.state;

		if (state.phase !== 'PLAYER_TURN') {
			return { valid: false, reason: 'Not your turn phase' };
		}

		const piece = state.pieces.find((p) => p.id === pieceId);
		if (!piece) return { valid: false, reason: 'Piece not found' };
		if (piece.team !== state.currentTurn) return { valid: false, reason: 'Not your piece' };

		const maxDist = piece.type === 'GOALIE' ? PIECE.GOALIE_MOVE_RADIUS : PIECE.MOVE_RADIUS;
		const d = dist(piece, { x: targetX, y: targetY });
		if (d > maxDist + 0.01) {
			return { valid: false, reason: `Move too far (${d.toFixed(1)} > ${maxDist})` };
		}

		const clampedX = clamp(targetX, 0, FIELD.WIDTH);
		const clampedY = clamp(targetY, 0, FIELD.HEIGHT);
		if (clampedX !== targetX || clampedY !== targetY) {
			return { valid: false, reason: 'Target out of bounds' };
		}

		if (!this.state.kickoffDone) {
			// Kickoff rule: must kick to team's side
			const isHome = state.currentTurn === 'HOME';
			const toHisSide = isHome ? targetX < FIELD.CENTER_X : targetX > FIELD.CENTER_X;

			const hitCheck = checkBallHit(
				piece,
				{ x: targetX, y: targetY },
				PIECE.PLAYER_RADIUS,
				state.ball,
				1,
			);
			if (hitCheck.hit && !toHisSide) {
				return { valid: false, reason: 'Kickoff must be to your own side!' };
			}
		}

		for (const other of state.pieces) {
			if (other.id === pieceId) continue;
			if (dist(other, { x: targetX, y: targetY }) < PIECE.PLAYER_RADIUS * 2) {
				return { valid: false, reason: 'Position occupied by another piece' };
			}
		}

		return { valid: true };
	}

	applyMove(pieceId: string, targetX: number, targetY: number): void {
		const piece = this.state.pieces.find((p) => p.id === pieceId);
		if (!piece) return;

		const startPos = { x: piece.x, y: piece.y };
		piece.x = targetX;
		piece.y = targetY;

		// Check for ball hit
		const hitCheck = checkBallHit(
			startPos,
			{ x: targetX, y: targetY },
			PIECE.PLAYER_RADIUS,
			this.state.ball,
			1,
		);
		if (hitCheck.hit && hitCheck.newBallPos) {
			this.state.ball = hitCheck.newBallPos;
			this.state.kickoffDone = true;

			// Check for goal
			const isHome = this.state.currentTurn === 'HOME';
			const goalSide = isHome ? FIELD.WIDTH : 0;
			const goalYMin = FIELD.GOAL_Y;
			const goalYMax = FIELD.GOAL_Y + FIELD.GOAL_HEIGHT;

			const scored = isHome ? this.state.ball.x >= goalSide : this.state.ball.x <= goalSide;

			if (scored && this.state.ball.y >= goalYMin && this.state.ball.y <= goalYMax) {
				// GOAL!
				if (isHome) this.state.score[0]++;
				else this.state.score[1]++;

				// Reset pieces for kickoff
				this.state.pieces = createInitialPieces();
				this.setupKickoff();
			}
		}

		this.advanceTurn();
	}

	isGameOver(): { over: boolean; winner?: Team; draw?: boolean } {
		if (this.state.turnNumber >= TURN_LIMIT) return { over: true, draw: true };
		return { over: false };
	}

	private advanceTurn(): void {
		this.state.phase = 'PLAYER_TURN';
		this.state.currentTurn = this.state.currentTurn === 'HOME' ? 'AWAY' : 'HOME';
		this.state.turnNumber++;
	}
}
