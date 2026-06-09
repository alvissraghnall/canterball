import {
  type Piece,
  type Ball,
  type GameState,
  type Point,
  type Team,
  type GamePhase,
  type ShotResult,
  FIELD,
  PIECE,
  SHOT,
  TURN_LIMIT,
  createInitialPieces,
  createInitialBall,
} from '@canterball/shared';

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export class GameStateMachine {
  state: GameState;
  shotPath: Point[] = [];
  shotResult: ShotResult | null = null;
  ballControl: string | null = null;

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
    };
    this.findBallControl();
  }

  private findBallControl(): void {
    this.ballControl = null;
    for (const p of this.state.pieces) {
      if (p.team === this.state.currentTurn && dist(p, this.state.ball) < PIECE.PLAYER_RADIUS + 1) {
        this.ballControl = p.id;
        return;
      }
    }
  }

  getPiecesForTeam(team: Team): Piece[] {
    return this.state.pieces.filter((p) => p.team === team);
  }

  getGoalie(team: Team): Piece | undefined {
    return this.state.pieces.find((p) => p.team === team && p.type === 'GOALIE');
  }

  private goaltY(): { min: number; max: number } {
    return { min: FIELD.GOAL_Y, max: FIELD.GOAL_Y + FIELD.GOAL_HEIGHT };
  }

  canMovePiece(pieceId: string, targetX: number, targetY: number): { valid: boolean; reason?: string } {
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

    piece.x = targetX;
    piece.y = targetY;

    if (dist(piece, this.state.ball) < PIECE.PLAYER_RADIUS + 1) {
      this.ballControl = pieceId;
    }

    this.advanceTurn();
  }

  canDeclareShot(pieceId: string): { valid: boolean; reason?: string } {
    const state = this.state;
    if (state.phase !== 'PLAYER_TURN') return { valid: false, reason: 'Not your turn' };
    if (this.ballControl !== pieceId) return { valid: false, reason: 'Piece does not have ball control' };

    const piece = state.pieces.find((p) => p.id === pieceId);
    if (!piece) return { valid: false, reason: 'Piece not found' };
    if (piece.team !== state.currentTurn) return { valid: false, reason: 'Not your piece' };

    const goalY = this.goaltY();
    const goalCenterY = goalY.min + FIELD.GOAL_HEIGHT / 2;
    const targetTeam: Team = piece.team === 'HOME' ? 'AWAY' : 'HOME';
    const goalX = targetTeam === 'HOME' ? 0 : FIELD.WIDTH;

    const distToGoal = dist(piece, { x: goalX, y: goalCenterY });
    if (distToGoal < 5) return { valid: false, reason: 'Too close to goal' };

    return { valid: true };
  }

  declareShot(pieceId: string): boolean {
    const result = this.canDeclareShot(pieceId);
    if (!result.valid) return false;
    this.state.phase = 'SHOT_DECLARED';
    return true;
  }

  canRepositionGoalie(x: number, y: number, team: Team): { valid: boolean; reason?: string } {
    if (this.state.phase !== 'SHOT_DECLARED') return { valid: false, reason: 'Not in shot phase' };

    const goalie = this.getGoalie(team);
    if (!goalie) return { valid: false, reason: 'No goalie' };

    const isHome = team === 'HOME';
    const boxXMin = isHome ? 0 : FIELD.WIDTH - 10;
    const boxXMax = isHome ? 10 : FIELD.WIDTH;
    const boxYMin = FIELD.GOAL_Y - 4;
    const boxYMax = FIELD.GOAL_Y + FIELD.GOAL_HEIGHT + 4;

    if (x < boxXMin || x > boxXMax || y < boxYMin || y > boxYMax) {
      return { valid: false, reason: 'Goalie reposition out of box' };
    }

    const d = dist(goalie, { x, y });
    if (d > PIECE.GOALIE_MOVE_RADIUS + 0.01) {
      return { valid: false, reason: `Move too far (${d.toFixed(1)} > ${PIECE.GOALIE_MOVE_RADIUS})` };
    }

    return { valid: true };
  }

  applyGoalieMove(x: number, y: number, team: Team): void {
    const goalie = this.getGoalie(team);
    if (!goalie) return;
    goalie.x = x;
    goalie.y = y;
  }

  resolveShot(
    attackingTeam: Team,
    target: Point,
    power: number,
    computePath: (from: Point, to: Point, power: number) => Point[],
    checkCollision: (path: Point[], goalie: Point, goalieRadius: number) => { result: ShotResult; hitGoalie: boolean; goal: boolean; out: boolean; finalPos: Point },
  ): { result: ShotResult; path: Point[]; ballFinalPosition: Point } {
    const attacker = this.state.pieces.find((p) => p.id === this.ballControl);
    if (!attacker) {
      return { result: 'OUT', path: [], ballFinalPosition: this.state.ball };
    }

    const goalie = this.getGoalie(attackingTeam === 'HOME' ? 'AWAY' : 'HOME')!;

    const path = computePath(attacker, target, power);
    const collision = checkCollision(path, goalie, PIECE.GOALIE_RADIUS);

    this.shotPath = path;
    this.shotResult = collision.result;
    this.state.ball.x = collision.finalPos.x;
    this.state.ball.y = collision.finalPos.y;
    this.ballControl = null;

    return {
      result: collision.result,
      path,
      ballFinalPosition: collision.finalPos,
    };
  }

  finishShot(resolution: ShotResult): void {
    if (resolution === 'GOAL') {
      if (this.state.currentTurn === 'HOME') {
        this.state.score[0]++;
      } else {
        this.state.score[1]++;
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
    this.findBallControl();
  }
}
