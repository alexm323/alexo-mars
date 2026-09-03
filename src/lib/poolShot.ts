// Pure geometry for the Humbleshot pool shot calculator: ghost-ball spot, cut
// angle, suggested power/hit point, and bank-shot solving off a rail. No
// canvas or DOM here — see pages/PoolCalculator.tsx for rendering + input.

export type Point = { x: number; y: number };

export const TABLE_W = 1000;
export const TABLE_H = 520;
export const BALL_R = 15;

const RAIL_PAD = 24;
const MARGIN = 50;

export const FELT = {
  left: MARGIN,
  top: MARGIN,
  right: TABLE_W - MARGIN,
  bottom: TABLE_H - MARGIN,
};

export const CUSHION = {
  left: FELT.left + RAIL_PAD,
  right: FELT.right - RAIL_PAD,
  top: FELT.top + RAIL_PAD,
  bottom: FELT.bottom - RAIL_PAD,
};

export type Pocket = Point & { id: string };

export const POCKETS: Pocket[] = [
  { x: CUSHION.left, y: CUSHION.top, id: "TL" },
  { x: TABLE_W / 2, y: CUSHION.top - 6, id: "TM" },
  { x: CUSHION.right, y: CUSHION.top, id: "TR" },
  { x: CUSHION.left, y: CUSHION.bottom, id: "BL" },
  { x: TABLE_W / 2, y: CUSHION.bottom + 6, id: "BM" },
  { x: CUSHION.right, y: CUSHION.bottom, id: "BR" },
];

export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function unit(a: Point, b: Point): Point {
  const d = dist(a, b) || 1;
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
}

export function clampToFelt(p: Point): Point {
  return {
    x: Math.max(CUSHION.left + 4, Math.min(CUSHION.right - 4, p.x)),
    y: Math.max(CUSHION.top + 4, Math.min(CUSHION.bottom - 4, p.y)),
  };
}

export function nearestPocket(p: Point): { pocket: Pocket; d: number } {
  let best = POCKETS[0];
  let bd = Infinity;
  for (const pk of POCKETS) {
    const d = dist(p, pk);
    if (d < bd) {
      bd = d;
      best = pk;
    }
  }
  return { pocket: best, d: bd };
}

type Base = {
  ghost: Point;
  contact: Point;
  uCueToGhost: Point;
  uObjToTarget: Point;
  angleDeg: number;
};

// Given a target point the object ball must travel toward, find the
// ghost-ball spot, contact point, and the resulting cut angle.
function solveShot(cueBall: Point, objectBall: Point, target: Point): Base {
  const uObjToTarget = unit(objectBall, target);
  const ghost = {
    x: objectBall.x - uObjToTarget.x * 2 * BALL_R,
    y: objectBall.y - uObjToTarget.y * 2 * BALL_R,
  };
  const contact = {
    x: objectBall.x - uObjToTarget.x * BALL_R,
    y: objectBall.y - uObjToTarget.y * BALL_R,
  };
  const uCueToGhost = unit(cueBall, ghost);
  const dot = uCueToGhost.x * uObjToTarget.x + uCueToGhost.y * uObjToTarget.y;
  const angleDeg = (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
  return { ghost, contact, uCueToGhost, uObjToTarget, angleDeg };
}

function rayRectExit(
  origin: Point,
  dir: Point,
  left: number,
  top: number,
  right: number,
  bottom: number,
  extra: number,
): Point {
  let tMax = Infinity;
  if (dir.x > 0) tMax = Math.min(tMax, (right - origin.x) / dir.x);
  else if (dir.x < 0) tMax = Math.min(tMax, (left - origin.x) / dir.x);
  if (dir.y > 0) tMax = Math.min(tMax, (bottom - origin.y) / dir.y);
  else if (dir.y < 0) tMax = Math.min(tMax, (top - origin.y) / dir.y);
  if (!isFinite(tMax)) tMax = 0;
  const t = tMax + extra;
  const p = { x: origin.x + dir.x * t, y: origin.y + dir.y * t };
  p.x = Math.max(10, Math.min(TABLE_W - 10, p.x));
  p.y = Math.max(10, Math.min(TABLE_H - 10, p.y));
  return p;
}

export type ShotResult = Base & {
  power: number;
  powerLabel: string;
  note: string;
  angleWarn: boolean;
  impossible: boolean;
  hitOffset: number;
  hitLabel: string;
  standPoint: Point;
  kind: "direct" | "bank";
  path: Point[];
  rail?: "left" | "right" | "top" | "bottom";
  bouncePoint?: Point;
};

function buildResult(base: Base, totalDist: number, cueBall: Point) {
  const maxDist = Math.hypot(TABLE_W, TABLE_H);
  let power = (totalDist / maxDist) * (1 + (base.angleDeg / 90) * 0.5);
  power = Math.max(0.08, Math.min(1, power));

  let powerLabel: string;
  if (power < 0.28) powerLabel = "Soft — gentle roll";
  else if (power < 0.55) powerLabel = "Medium — smooth stroke";
  else if (power < 0.8) powerLabel = "Firm — solid follow-through";
  else powerLabel = "Hard — full stroke";

  let note: string;
  let angleWarn = false;
  let impossible = false;
  if (base.angleDeg > 100) {
    note =
      "Not makeable — the object ball is on the far side of the cue ball from this target. Try the bank option or a different pocket.";
    angleWarn = true;
    impossible = true;
  } else if (base.angleDeg > 80) {
    note = "Very thin cut — close to unmakeable in one shot.";
    angleWarn = true;
  } else if (base.angleDeg > 55) {
    note = "A tough cut. Aim precisely at the ghost-ball marker and keep your stroke straight.";
  } else if (base.angleDeg < 12) {
    note = "Nearly a straight shot — aim through both balls into the target.";
  } else {
    note = "A comfortable cut. Focus on hitting the ghost-ball spot dead center.";
  }

  // Recommended vertical strike point on the cue ball face (no side english yet).
  let hitOffset = 0;
  let hitLabel = "Dead center — most reliable contact.";
  const cueDist = dist(cueBall, base.ghost);
  if (power > 0.72) {
    hitOffset = -0.32;
    hitLabel = "Slightly above center — follow, keeps a hard stroke rolling true.";
  } else if (cueDist < 90 && power < 0.35) {
    hitOffset = 0.28;
    hitLabel = "Slightly below center — a touch of draw keeps the cue ball from creeping forward.";
  }

  const standDir = { x: -base.uCueToGhost.x, y: -base.uCueToGhost.y };
  const standPoint = rayRectExit(cueBall, standDir, CUSHION.left, CUSHION.top, CUSHION.right, CUSHION.bottom, 30);

  return { ...base, power, powerLabel, note, angleWarn, impossible, hitOffset, hitLabel, standPoint };
}

export function computeDirect(cueBall: Point, objectBall: Point, pocket: Point): ShotResult {
  const base = solveShot(cueBall, objectBall, pocket);
  const totalDist = dist(cueBall, base.ghost) + dist(objectBall, pocket);
  const res = buildResult(base, totalDist, cueBall);
  return { ...res, kind: "direct", path: [objectBall, pocket] };
}

export function computeBank(cueBall: Point, objectBall: Point, pocket: Point): ShotResult | null {
  const rails = ["left", "right", "top", "bottom"] as const;
  let best: ShotResult | null = null;

  for (const rail of rails) {
    let mirrored: Point;
    if (rail === "left") mirrored = { x: 2 * CUSHION.left - pocket.x, y: pocket.y };
    else if (rail === "right") mirrored = { x: 2 * CUSHION.right - pocket.x, y: pocket.y };
    else if (rail === "top") mirrored = { x: pocket.x, y: 2 * CUSHION.top - pocket.y };
    else mirrored = { x: pocket.x, y: 2 * CUSHION.bottom - pocket.y };

    const dx = mirrored.x - objectBall.x;
    const dy = mirrored.y - objectBall.y;
    let bouncePoint: Point;

    if (rail === "left" || rail === "right") {
      const railX = rail === "left" ? CUSHION.left : CUSHION.right;
      if (Math.abs(dx) < 1e-6) continue;
      const t = (railX - objectBall.x) / dx;
      if (t <= 0.02 || t >= 0.98) continue;
      const by = objectBall.y + dy * t;
      if (by < CUSHION.top + 35 || by > CUSHION.bottom - 35) continue;
      bouncePoint = { x: railX, y: by };
    } else {
      const railY = rail === "top" ? CUSHION.top : CUSHION.bottom;
      if (Math.abs(dy) < 1e-6) continue;
      const t = (railY - objectBall.y) / dy;
      if (t <= 0.02 || t >= 0.98) continue;
      const bx = objectBall.x + dx * t;
      if (bx < CUSHION.left + 35 || bx > CUSHION.right - 35) continue;
      bouncePoint = { x: bx, y: railY };
    }

    const base = solveShot(cueBall, objectBall, bouncePoint);
    if (base.angleDeg > 100) continue; // not a makeable contact even for the bank leg
    const totalDist = dist(cueBall, base.ghost) + dist(objectBall, bouncePoint) + dist(bouncePoint, pocket);
    const res = buildResult(base, totalDist, cueBall);
    const full: ShotResult = { ...res, kind: "bank", rail, bouncePoint, path: [objectBall, bouncePoint, pocket] };
    if (!best || full.angleDeg < best.angleDeg) best = full;
  }

  return best;
}
