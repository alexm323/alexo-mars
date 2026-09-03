import { useEffect, useRef, useState } from "react";
import {
  BALL_R,
  FELT,
  POCKETS,
  TABLE_H,
  TABLE_W,
  clampToFelt,
  computeBank,
  computeDirect,
  dist,
  nearestPocket,
  type Point,
  type ShotResult,
} from "../lib/poolShot";

type Mode = "direct" | "bank";

const CUE_COLOR = "#F5F1E6";
const OBJECT_COLOR = "#E0793C";
const MARK_COLOR = "#4A6FA5";
const WARN_COLOR = "#C0533E";
const AIM_LINE_COLOR = "#F2EFE4";
const TABLE_BG = "#241C15";
const FELT_COLOR = "#1F5C3B";
const FELT_HILITE = "#256B47";
const RAIL_COLOR = "#6B4226";
const STAND_COLOR = "#FF10F0";

function modeButtonClass(active: boolean) {
  return (
    "rounded-full px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 " +
    (active
      ? "bg-violet-600 text-white"
      : "border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400")
  );
}

function drawTable(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, TABLE_W, TABLE_H);
  ctx.fillStyle = TABLE_BG;
  ctx.fillRect(0, 0, TABLE_W, TABLE_H);

  const cx = (FELT.left + FELT.right) / 2;
  const cy = (FELT.top + FELT.bottom) / 2;
  const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, TABLE_W * 0.6);
  grad.addColorStop(0, FELT_HILITE);
  grad.addColorStop(1, FELT_COLOR);
  ctx.fillStyle = grad;
  ctx.fillRect(FELT.left, FELT.top, FELT.right - FELT.left, FELT.bottom - FELT.top);

  ctx.strokeStyle = RAIL_COLOR;
  ctx.lineWidth = 10;
  ctx.strokeRect(FELT.left, FELT.top, FELT.right - FELT.left, FELT.bottom - FELT.top);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 3;
  ctx.strokeRect(FELT.left + 8, FELT.top + 8, FELT.right - FELT.left - 16, FELT.bottom - FELT.top - 16);

  POCKETS.forEach((pk) => {
    ctx.beginPath();
    ctx.arc(pk.x, pk.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#0d0a08";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pk.x, pk.y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = RAIL_COLOR;
    ctx.lineWidth = 4;
    ctx.stroke();
  });
}

function drawBall(ctx: CanvasRenderingContext2D, p: Point | null, color: string) {
  if (!p) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, BALL_R, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(p.x - 5, p.y - 6, 2, p.x, p.y, BALL_R);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.25, color);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.stroke();
  ctx.restore();
}

// A "you are here"-map-style star pin, glowing neon pink.
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  color: string,
) {
  const spikes = 5;
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2; // first point straight up

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
  for (let i = 0; i < spikes; i++) {
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
  }
  ctx.closePath();

  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.restore();
}

function drawLines(ctx: CanvasRenderingContext2D, shot: ShotResult | null, cueBall: Point | null) {
  if (!shot || !cueBall) return;

  ctx.save();
  ctx.setLineDash([7, 6]);
  ctx.strokeStyle = shot.angleWarn ? WARN_COLOR : AIM_LINE_COLOR;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cueBall.x, cueBall.y);
  ctx.lineTo(shot.ghost.x, shot.ghost.y);
  ctx.stroke();

  ctx.strokeStyle = OBJECT_COLOR;
  ctx.setLineDash([]);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(shot.path[0].x, shot.path[0].y);
  for (let i = 1; i < shot.path.length; i++) ctx.lineTo(shot.path[i].x, shot.path[i].y);
  ctx.stroke();
  ctx.restore();

  if (shot.kind === "bank" && shot.bouncePoint) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(shot.bouncePoint.x, shot.bouncePoint.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = MARK_COLOR;
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(242,239,228,0.8)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(shot.ghost.x, shot.ghost.y, BALL_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(shot.contact.x, shot.contact.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = MARK_COLOR;
  ctx.fill();

  const sp = shot.standPoint;
  ctx.save();
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = "rgba(242,239,228,0.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cueBall.x, cueBall.y);
  ctx.lineTo(sp.x, sp.y);
  ctx.stroke();
  ctx.restore();

  drawStar(ctx, sp.x, sp.y, 11, 4.5, STAND_COLOR);

  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillStyle = STAND_COLOR;
  ctx.textAlign = sp.x < TABLE_W / 2 ? "left" : "right";
  ctx.textBaseline = sp.y < TABLE_H / 2 ? "bottom" : "top";
  ctx.fillText("stand here", sp.x + (sp.x < TABLE_W / 2 ? 16 : -16), sp.y + (sp.y < TABLE_H / 2 ? -12 : 12));
}

function drawHitBall(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 10;
  ctx.clearRect(0, 0, w, h);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, 4, cx, cy, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#e7e2d4");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#b9b09a";
  ctx.stroke();

  ctx.save();
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = "#c9c0a8";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();
  ctx.restore();

  const hy = cy + offset * r;
  ctx.beginPath();
  ctx.arc(cx, hy, 9, 0, Math.PI * 2);
  ctx.fillStyle = OBJECT_COLOR;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1a1208";
  ctx.stroke();
}

export default function PoolCalculator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitCanvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef<"cue" | "object" | null>(null);
  const runIdRef = useRef(0);

  const [cueBall, setCueBall] = useState<Point | null>(null);
  const [objectBall, setObjectBall] = useState<Point | null>(null);
  const [pocket, setPocket] = useState<Point | null>(null);
  const [mode, setMode] = useState<Mode>("direct");
  const [animating, setAnimating] = useState(false);

  const ready = Boolean(cueBall && objectBall && pocket);
  const direct = cueBall && objectBall && pocket ? computeDirect(cueBall, objectBall, pocket) : null;
  const bank = cueBall && objectBall && pocket ? computeBank(cueBall, objectBall, pocket) : null;

  // Keep mode valid: fall back to direct if the chosen bank vanishes, and
  // auto-suggest a bank when the direct shot isn't makeable but one exists.
  useEffect(() => {
    setMode((m) => {
      if (m === "bank" && !bank) return "direct";
      if (direct?.impossible && bank) return "bank";
      return m;
    });
  }, [direct, bank]);

  const shot = mode === "bank" ? bank : direct;

  const hintText = !cueBall
    ? "Tap the table to place the cue ball (white)"
    : !objectBall
      ? "Now tap to place the object ball"
      : !pocket
        ? "Tap a pocket to aim the shot"
        : "Drag either ball to adjust — line updates live";

  // Redraw the table whenever the balls or the active shot change.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawTable(ctx);
    drawLines(ctx, shot, cueBall);
    drawBall(ctx, objectBall, OBJECT_COLOR);
    drawBall(ctx, cueBall, CUE_COLOR);
  }, [cueBall, objectBall, shot]);

  // Mirror the recommended hit point onto the little cue-ball diagram.
  useEffect(() => {
    const canvas = hitCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    if (shot) drawHitBall(ctx, canvas.width, canvas.height, shot.hitOffset);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [shot]);

  // A drag can end with the pointer outside the canvas — always catch pointerup.
  useEffect(() => {
    function onPointerUp() {
      draggingRef.current = null;
    }
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, []);

  function toCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (TABLE_W / rect.width),
      y: (e.clientY - rect.top) * (TABLE_H / rect.height),
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (animating) return;
    const p = toCanvasPoint(e);
    if (cueBall && dist(p, cueBall) < BALL_R * 1.8) {
      draggingRef.current = "cue";
      return;
    }
    if (objectBall && dist(p, objectBall) < BALL_R * 1.8) {
      draggingRef.current = "object";
      return;
    }
    if (!cueBall) {
      setCueBall(clampToFelt(p));
    } else if (!objectBall) {
      setObjectBall(clampToFelt(p));
    } else {
      const { pocket: pk, d } = nearestPocket(p);
      if (d < 60) setPocket(pk);
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!draggingRef.current || animating) return;
    const p = clampToFelt(toCanvasPoint(e));
    if (draggingRef.current === "cue") setCueBall(p);
    else setObjectBall(p);
  }

  function reset() {
    runIdRef.current++;
    draggingRef.current = null;
    setAnimating(false);
    setCueBall(null);
    setObjectBall(null);
    setPocket(null);
    setMode("direct");
  }

  function animateShot() {
    if (!shot || !cueBall || !objectBall || animating) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const runId = ++runIdRef.current;
    setAnimating(true);

    const startCue: Point = { x: cueBall.x, y: cueBall.y };
    const endCue: Point = { x: shot.ghost.x, y: shot.ghost.y };
    const objPath = shot.path;
    const dur1 = 500;
    const durEach = 420;
    const totalObjDur = durEach * (objPath.length - 1);
    const t0 = performance.now();

    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    function objPosAt(elapsedAfterCue: number): Point {
      const segTime = elapsedAfterCue / durEach;
      const segIndex = Math.min(objPath.length - 2, Math.floor(segTime));
      const segT = ease(Math.min(1, segTime - segIndex));
      const a = objPath[segIndex];
      const b = objPath[segIndex + 1];
      return { x: a.x + (b.x - a.x) * segT, y: a.y + (b.y - a.y) * segT };
    }

    function frame(now: number) {
      if (runIdRef.current !== runId || !ctx) return;
      const elapsed = now - t0;
      drawTable(ctx);
      drawLines(ctx, shot!, cueBall);
      drawBall(ctx, objectBall, OBJECT_COLOR);
      drawBall(ctx, cueBall, CUE_COLOR);

      if (elapsed <= dur1) {
        const t = ease(elapsed / dur1);
        const p = { x: startCue.x + (endCue.x - startCue.x) * t, y: startCue.y + (endCue.y - startCue.y) * t };
        drawBall(ctx, p, CUE_COLOR);
        requestAnimationFrame(frame);
      } else if (elapsed <= dur1 + totalObjDur) {
        drawBall(ctx, endCue, CUE_COLOR);
        const p = objPosAt(elapsed - dur1);
        drawBall(ctx, p, OBJECT_COLOR);
        requestAnimationFrame(frame);
      } else {
        drawTable(ctx);
        drawLines(ctx, shot!, cueBall);
        drawBall(ctx, endCue, CUE_COLOR);
        window.setTimeout(() => {
          if (runIdRef.current !== runId) return;
          setAnimating(false);
          drawTable(ctx);
          drawLines(ctx, shot!, cueBall);
          drawBall(ctx, objectBall, OBJECT_COLOR);
          drawBall(ctx, cueBall, CUE_COLOR);
        }, 700);
      }
    }
    requestAnimationFrame(frame);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">🎱 Humbleshot</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Place the balls. Pick a pocket. See the exact line.
        </p>
      </div>

      <div
        className={
          "mx-auto max-w-md rounded-lg border px-4 py-2 text-sm transition-colors " +
          (ready
            ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300"
            : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400")
        }
      >
        {hintText}
      </div>

      <div className="w-full rounded-2xl bg-[#351F15] p-2.5 shadow-lg ring-1 ring-inset ring-[#6B4226]/60">
        <div className="aspect-[2/1.15] w-full">
          <canvas
            ref={canvasRef}
            width={TABLE_W}
            height={TABLE_H}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            className="block h-full w-full touch-none rounded-md cursor-crosshair"
            style={{ WebkitTapHighlightColor: "transparent" }}
          />
        </div>
      </div>

      {ready && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => direct && setMode("direct")}
            className={modeButtonClass(mode === "direct")}
          >
            Direct shot
          </button>
          <button
            type="button"
            onClick={() => bank && setMode("bank")}
            disabled={!bank}
            className={modeButtonClass(mode === "bank")}
          >
            Bank off a rail
          </button>
        </div>
      )}

      {shot && (
        <div className="grid w-full grid-cols-2 gap-x-5 gap-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Cut angle</span>
            <span
              className={
                "text-lg font-semibold " +
                (shot.angleWarn ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white")
              }
            >
              {shot.angleDeg.toFixed(0)}°
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Suggested power
            </span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              {shot.impossible ? "—" : shot.powerLabel}
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <canvas ref={hitCanvasRef} width={180} height={180} className="h-[78px] w-[78px] flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Where to hit the cue ball
              </span>
              <span className="text-sm font-medium leading-snug text-slate-900 dark:text-white">
                {shot.hitLabel}
              </span>
            </div>
          </div>

          <p className="col-span-2 border-t border-slate-200 pt-3 text-sm leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {shot.note}
            {shot.kind === "bank" && shot.rail ? ` (banking off the ${shot.rail} rail)` : ""}
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={animateShot}
          disabled={!shot || shot.impossible || animating}
          className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Take the shot
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-600">
        Straight-stroke hits only — no side english yet. That's the next version.
      </p>
    </div>
  );
}
