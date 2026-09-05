import {
	type Piece,
	type Point,
	type GameState,
	type Restart,
	type Team,
	FIELD,
	PIECE,
	BALL_RADIUS,
	RESTART,
	TURN_LIMIT,
	createInitialPieces,
} from '@canterball/shared';

import { checkBallHit } from './physics';

function dist(a: Point, b: Point): number {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function clamp(v: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, v));
}

function otherTeam(team: Team): Team {
	return team === 'HOME' ? 'AWAY' : 'HOME';
}

/** Where did the raw (unclamped) ball position cross a boundary, if anywhere? */
type OutEvent = 'GOAL' | 'END' | 'TOUCH' | null;

function classifyOut(p: Point): OutEvent {
	const outX = p.x < 0 || p.x > FIELD.WIDTH;
	const outY = p.y < 0 || p.y > FIELD.HEIGHT;
	if (!outX && !outY) return null;

	const inMouth = p.y >= FIELD.GOAL_Y && p.y <= FIELD.GOAL_Y + FIELD.GOAL_HEIGHT;
	if (outX && inMouth) return 'GOAL';
	if (outX) return 'END';
	return 'TOUCH';
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
			ball: { x: FIELD.CENTER_X, y: FIELD.CENTER_Y },
			score: [0, 0],
			kickoffDone: false,
			lastTouch: null,
			restart: null,
		};
		this.beginKickoff('HOME');
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

		let hitCheck: ReturnType<typeof checkBallHit> = { hit: false };
		if (state.restart) {
			// A dead ball must be taken immediately: the moving piece has to
			// make contact with the ball on the same move.
			hitCheck = checkBallHit(
				piece,
				{ x: targetX, y: targetY },
				PIECE.PLAYER_RADIUS,
				state.ball,
				BALL_RADIUS,
			);
			if (!hitCheck.hit) {
				const kind = state.restart.kind === 'THROW_IN'
					? 'throw-in'
					: state.restart.kind === 'GOAL_KICK'
						? 'goal kick'
						: state.restart.kind === 'CORNER'
							? 'corner'
							: 'kickoff';
				return { valid: false, reason: `Take the ${kind} first` };
			}
		}

		if (!state.kickoffDone && !hitCheck.hit) {
			// Kickoff rule: must kick to team's side
			const isHome = state.currentTurn === 'HOME';
			const toHisSide = isHome ? targetX < FIELD.CENTER_X : targetX > FIELD.CENTER_X;

			hitCheck = checkBallHit(
				piece,
				{ x: targetX, y: targetY },
				PIECE.PLAYER_RADIUS,
				state.ball,
				BALL_RADIUS,
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
			BALL_RADIUS,
		);
		if (hitCheck.hit && hitCheck.newBallPos) {
			const raw = hitCheck.newBallPos;
			const shooter: Team = this.state.currentTurn;

			this.state.lastTouch = shooter;
			this.state.kickoffDone = true;

			const out = classifyOut(raw);

			if (out === 'GOAL') {
				// The team that attacks this end gets the goal, handling own-goals.
				const scoringTeam: Team = raw.x > FIELD.WIDTH ? 'HOME' : 'AWAY';
				this.handleGoal(scoringTeam);
				return;
			}

			if (out) {
				// Dead ball → set up the restart and hand the ball to the awarded team.
				const restart = this.resolveRestart(out, shooter, raw);
				this.state.ball = {
					x: clamp(restart.x, 0, FIELD.WIDTH),
					y: clamp(restart.y, 0, FIELD.HEIGHT),
				};
				this.state.restart = restart;
				this.setupSetPiece(restart);
				this.state.currentTurn = restart.team;
				return; // no advanceTurn: the set-piece kick consumes the next turn
			}

			// In play
			this.state.ball = {
				x: clamp(raw.x, 0, FIELD.WIDTH),
				y: clamp(raw.y, 0, FIELD.HEIGHT),
			};
			this.state.restart = null;
		}

		this.advanceTurn();
	}

	/** Resolve where the dead ball is placed and who takes it. */
	private resolveRestart(out: Exclude<OutEvent, 'GOAL'>, shooter: Team, raw: Point): Restart {
		if (out === 'TOUCH') {
			// Throw-in to the team that did NOT touch it last.
			const team = otherTeam(shooter);
			const y = raw.y <= FIELD.CENTER_Y ? RESTART.THROW_INSET : FIELD.HEIGHT - RESTART.THROW_INSET;
			return {
				kind: 'THROW_IN',
				team,
				x: clamp(raw.x, RESTART.THROW_MIN_X, FIELD.WIDTH - RESTART.THROW_MIN_X),
				y,
			};
		}

		// Ball went out over an end line (outside the goal mouth). The team
		// attacking that end mirrors the ball's exit.
		const attacking: Team = raw.x > FIELD.WIDTH ? 'HOME' : 'AWAY';

		if (shooter === attacking) {
			// Attacker put it out → goal kick to the defending team.
			const team = otherTeam(attacking);
			const x = team === 'HOME' ? RESTART.GOAL_KICK_X : FIELD.WIDTH - RESTART.GOAL_KICK_X;
			return {
				kind: 'GOAL_KICK',
				team,
				x,
				y: clamp(raw.y, FIELD.GOAL_Y, FIELD.GOAL_Y + FIELD.GOAL_HEIGHT),
			};
		}

		// Defending team cleared it out → corner to the attacking team.
		const x = attacking === 'HOME' ? FIELD.WIDTH - RESTART.CORNER_INSET : RESTART.CORNER_INSET;
		const y = raw.y <= FIELD.CENTER_Y ? RESTART.CORNER_INSET : FIELD.HEIGHT - RESTART.CORNER_INSET;
		return { kind: 'CORNER', team: attacking, x, y };
	}

	private handleGoal(shooter: Team): void {
		if (shooter === 'HOME') this.state.score[0]++;
		else this.state.score[1]++;

		// Conceding team takes the kickoff.
		this.beginKickoff(otherTeam(shooter));
	}

	private beginKickoff(team: Team): void {
		this.state.pieces = createInitialPieces();
		this.state.ball = { x: FIELD.CENTER_X, y: FIELD.CENTER_Y };
		this.state.lastTouch = null;
		this.state.kickoffDone = false;
		this.state.currentTurn = team;
		this.state.restart = { kind: 'KICKOFF', team, x: FIELD.CENTER_X, y: FIELD.CENTER_Y };

		// Position the team's far-side striker over the ball for kickoff.
		const strikerId = `${team}_10`;
		const striker = this.state.pieces.find((p) => p.id === strikerId);
		if (striker) {
			striker.x = FIELD.CENTER_X;
			striker.y = FIELD.CENTER_Y;
		}
	}

	/** Step the awarded team's nearest outfield player up to take the set piece. */
	private setupSetPiece(restart: Restart): void {
		const outfield = this.state.pieces.filter(
			(p) => p.team === restart.team && p.type === 'PLAYER',
		);
		const pool = outfield.length > 0 ? outfield : this.state.pieces.filter((p) => p.team === restart.team);

		let taker: Piece | null = null;
		let best = Infinity;
		for (const p of pool) {
			const d = dist(p, { x: restart.x, y: restart.y });
			if (d < best) {
				best = d;
				taker = p;
			}
		}

		if (taker) {
			taker.x = restart.x;
			taker.y = restart.y;
		}
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