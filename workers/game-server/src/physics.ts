import { type Point, FIELD } from '@canterball/shared';

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
