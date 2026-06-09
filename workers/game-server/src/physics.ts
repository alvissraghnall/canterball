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
      return { result: 'SAVE', hitGoalie: true, goal: false, out: false, finalPos: deflected };
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
  const edge = (t: number) => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });

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
