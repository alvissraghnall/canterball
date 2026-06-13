import { type Point, type ShotResult, FIELD, PIECE, SHOT } from '@canterball/shared';

export function computeShotPath(from: Point, to: Point, power: number): Point[] {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const totalDist = Math.sqrt(dx * dx + dy * dy);
	if (totalDist === 0) return [from];

	const maxDist = 20 + power * 3;
	const ratio = Math.min(maxDist / totalDist, 1);
	const endX = from.x + dx * ratio;
	const endY = from.y + dy * ratio;

	const steps = Math.max(10, Math.ceil(maxDist / SHOT.PATH_POINT_INTERVAL));
	const path: Point[] = [];

	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const x = from.x + (endX - from.x) * t;
		const y = from.y + (endY - from.y) * t + parabolicArc(t, power);
		path.push({ x, y });
	}

	return path;
}

function parabolicArc(t: number, power: number): number {
	const arcHeight = power * 0.3;
	return -arcHeight * 4 * t * (t - 1);
}

export function checkBallHit(
	playerStart: Point,
	playerEnd: Point,
	playerRadius: number,
	ball: Point,
	ballRadius: number,
): { hit: boolean; newBallPos?: Point } {
	const dx = playerEnd.x - playerStart.x;
	const dy = playerEnd.y - playerStart.y;
	const moveDist = Math.sqrt(dx * dx + dy * dy);
	if (moveDist === 0) return { hit: false };

	// Distance from ball to the line segment of player movement
	const distToPath = pointToSegmentDist(ball, playerStart, playerEnd);
	const threshold = playerRadius + ballRadius;

	if (distToPath < threshold) {
		// We hit the ball.
		// "Coincidence" factor: 1 if path goes through ball center, 0 if it just touches the edge.
		const coincidence = 1 - distToPath / threshold;

		// The ball moves in the direction of the player's movement,
		// but also slightly away from the path center if it was a glancing blow.
		// For simplicity, let's make it move in the player's direction but scaled by coincidence.

		// Base power is the move distance
		const power = moveDist * 1.5 * coincidence;

		// Direction is primarily the player's movement direction
		const angle = Math.atan2(dy, dx);

		// Add a bit of "glance" offset?
		// If we hit it on the left side, it should veer right.
		// We can find the projection of the ball onto the path to see which side it's on.
		const hitDirX = dx / moveDist;
		const hitDirY = dy / moveDist;

		// Normal to the path
		const nx = -hitDirY;
		const ny = hitDirX;

		// Side factor: dot product of (Ball - PlayerStart) with Normal
		const side = (ball.x - playerStart.x) * nx + (ball.y - playerStart.y) * ny;
		const glanceAngle = (side / threshold) * 0.5; // Up to 0.5 radians deflection

		const finalAngle = angle + glanceAngle;

		const newBallX = ball.x + Math.cos(finalAngle) * power;
		const newBallY = ball.y + Math.sin(finalAngle) * power;

		return {
			hit: true,
			newBallPos: {
				x: Math.max(0, Math.min(FIELD.WIDTH, newBallX)),
				y: Math.max(0, Math.min(FIELD.HEIGHT, newBallY)),
			},
		};
	}

	return { hit: false };
}

function pointToSegmentDist(p: Point, a: Point, b: Point): number {
	const abx = b.x - a.x;
	const aby = b.y - a.y;
	const len2 = abx * abx + aby * aby;
	if (len2 === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
	let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
	t = Math.max(0, Math.min(1, t));
	const projX = a.x + t * abx;
	const projY = a.y + t * aby;
	return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
}

export function checkShotCollision(
	path: Point[],
	goalie: Point,
	goalieRadius: number,
	attackingTeam: 'HOME' | 'AWAY',
): { result: ShotResult; hitGoalie: boolean; goal: boolean; out: boolean; finalPos: Point } {
	const goalSide = attackingTeam === 'HOME' ? FIELD.WIDTH : 0;
	const goalYMin = FIELD.GOAL_Y;
	const goalYMax = FIELD.GOAL_Y + FIELD.GOAL_HEIGHT;

	for (let i = 0; i < path.length; i++) {
		const pt = path[i];

		if (pt.x < 0 || pt.x > FIELD.WIDTH || pt.y < 0 || pt.y > FIELD.HEIGHT) {
			const prev = i > 0 ? path[i - 1] : pt;
			const clipped = clipToFieldBounds(prev, pt);
			return { result: 'OUT', hitGoalie: false, goal: false, out: true, finalPos: clipped };
		}

		const dGoalie = pointToSegmentDist(goalie, pt, path[Math.min(i + 1, path.length - 1)]);
		if (dGoalie < goalieRadius) {
			const deflected = deflectBall(path, i, goalie);
			return {
				result: 'SAVE',
				hitGoalie: true,
				goal: false,
				out: false,
				finalPos: deflected,
			};
		}

		const prevPt = i > 0 ? path[i - 1] : pt;
		if (crossesGoalLine(prevPt, pt, goalSide, goalYMin, goalYMax)) {
			return { result: 'GOAL', hitGoalie: false, goal: true, out: false, finalPos: pt };
		}
	}

	const last = path[path.length - 1];
	const goalDist = Math.abs(last.x - goalSide);
	return {
		result: goalDist < 5 && last.y >= goalYMin && last.y <= goalYMax ? 'GOAL' : 'OUT',
		hitGoalie: false,
		goal: goalDist < 5 && last.y >= goalYMin && last.y <= goalYMax,
		out: !(goalDist < 5 && last.y >= goalYMin && last.y <= goalYMax),
		finalPos: last,
	};
}

function crossesGoalLine(
	a: Point,
	b: Point,
	goalX: number,
	goalYMin: number,
	goalYMax: number,
): boolean {
	if ((a.x < goalX && b.x >= goalX) || (a.x >= goalX && b.x < goalX)) {
		const t = (goalX - a.x) / (b.x - a.x);
		const y = a.y + (b.y - a.y) * t;
		return y >= goalYMin && y <= goalYMax;
	}
	return false;
}

function clipToFieldBounds(from: Point, to: Point): Point {
	const edge = (t: number) => ({
		x: from.x + (to.x - from.x) * t,
		y: from.y + (to.y - from.y) * t,
	});

	const ts: { t: number; p: Point }[] = [];
	const pushIf = (t: number) => {
		if (t >= 0 && t <= 1) {
			const p = edge(t);
			if (p.x >= 0 && p.x <= FIELD.WIDTH && p.y >= 0 && p.y <= FIELD.HEIGHT) {
				ts.push({ t, p });
			}
		}
	};

	if (to.x !== from.x) {
		pushIf(-from.x / (to.x - from.x));
		pushIf((FIELD.WIDTH - from.x) / (to.x - from.x));
	}
	if (to.y !== from.y) {
		pushIf(-from.y / (to.y - from.y));
		pushIf((FIELD.HEIGHT - from.y) / (to.y - from.y));
	}

	ts.sort((a, b) => a.t - b.t);
	return ts.length > 0 ? ts[0].p : from;
}

function deflectBall(path: Point[], hitIndex: number, goalie: Point): Point {
	const hit = path[hitIndex];
	const dx = hit.x - goalie.x;
	const dy = hit.y - goalie.y;
	const d = Math.sqrt(dx * dx + dy * dy) || 1;
	const deflectDist = 5;
	const deflectedX = goalie.x - (dx / d) * deflectDist;
	const deflectedY = goalie.y - (dy / d) * deflectDist;
	return {
		x: Math.max(0, Math.min(FIELD.WIDTH, deflectedX)),
		y: Math.max(0, Math.min(FIELD.HEIGHT, deflectedY)),
	};
}
