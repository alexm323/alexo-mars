import { useEffect, useRef, useState } from "react";
import { generateSlotName, joinSlotName, randomSpinWord } from "../lib/paintNames";

const DEFAULT_COLOR = "#8a5fd6";
const SPIN_INTERVAL_MS = 70;
const STOP_DELAYS = { x: 600, y: 950, z: 1300 } as const;
const LAND_BOUNCE_MS = 240;
const MARQUEE_LIGHT_COUNT = 12;

function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return "#" + n.toString(16).padStart(6, "0");
}

type ReelKey = "x" | "y" | "z";

export default function PaintNameGenerator() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [reel, setReel] = useState<{ x: string; y: string; z: string }>({ x: "", y: "", z: "" });
  const [spinning, setSpinning] = useState(false);
  const [hasPulled, setHasPulled] = useState(false);
  const [stale, setStale] = useState(false); // color changed since last pull
  const [pulled, setPulled] = useState(false); // lever animation
  const [landed, setLanded] = useState<Record<ReelKey, boolean>>({ x: false, y: false, z: false });
  const [celebrate, setCelebrate] = useState(false); // whole-cabinet glow on a fresh result
  const [history, setHistory] = useState<{ color: string; name: string }[]>([]);

  const timeoutIds = useRef<number[]>([]);
  const intervalIds = useRef<number[]>([]);

  function clearTimers() {
    timeoutIds.current.forEach((id) => clearTimeout(id));
    intervalIds.current.forEach((id) => clearInterval(id));
    timeoutIds.current = [];
    intervalIds.current = [];
  }

  useEffect(() => clearTimers, []);

  function pullLever(nextColor = color) {
    if (spinning) return;
    clearTimers();

    setColor(nextColor);
    setStale(false);
    setHasPulled(true);
    setSpinning(true);
    setPulled(true);
    timeoutIds.current.push(window.setTimeout(() => setPulled(false), 260));

    const final = generateSlotName(nextColor);
    const setters: Record<ReelKey, (v: string) => void> = {
      x: (v) => setReel((r) => ({ ...r, x: v })),
      y: (v) => setReel((r) => ({ ...r, y: v })),
      z: (v) => setReel((r) => ({ ...r, z: v })),
    };

    (Object.keys(setters) as ReelKey[]).forEach((key) => {
      const intervalId = window.setInterval(() => setters[key](randomSpinWord()), SPIN_INTERVAL_MS);
      intervalIds.current.push(intervalId);

      const stopId = window.setTimeout(() => {
        clearInterval(intervalId);
        setters[key](final[key]);
        setLanded((l) => ({ ...l, [key]: true }));
        window.setTimeout(() => setLanded((l) => ({ ...l, [key]: false })), LAND_BOUNCE_MS);

        if (key === "z") {
          setSpinning(false);
          setCelebrate(true);
          window.setTimeout(() => setCelebrate(false), 900);
          setHistory((h) => [{ color: nextColor, name: joinSlotName(final) }, ...h].slice(0, 8));
        }
      }, STOP_DELAYS[key]);
      timeoutIds.current.push(stopId);
    });
  }

  function reelText(key: ReelKey) {
    if (spinning) return reel[key];
    if (!hasPulled || stale) return "?";
    if (key === "y" && reel.y === "") return "—";
    return reel[key];
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">🎰 Paint Name Generator</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Pick a color, pull the lever, see what it lands on. Middle reel likes to come up empty.
        </p>
      </div>

      {/* Cabinet */}
      <div
        className={
          "w-full max-w-md rounded-[28px] bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 p-[3px] shadow-lg dark:from-amber-600 dark:via-amber-700 dark:to-amber-900 " +
          (celebrate ? "cabinet-win" : "")
        }
      >
        <div className="flex flex-col items-center gap-5 rounded-[25px] bg-gradient-to-b from-slate-800 to-slate-900 px-4 py-6 dark:from-black dark:to-slate-950 sm:px-8">
          {/* Marquee lights */}
          <div className="flex w-full justify-between px-1">
            {Array.from({ length: MARQUEE_LIGHT_COUNT }).map((_, i) => (
              <span
                key={i}
                className="marquee-light h-1.5 w-1.5 rounded-full bg-amber-300 sm:h-2 sm:w-2"
                style={{ animationDelay: `${(i * 130) % 1600}ms` }}
              />
            ))}
          </div>

          <div
            className="h-9 w-full max-w-xs rounded-lg border border-white/20 shadow-inner transition-colors"
            style={{ backgroundColor: color }}
          />

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-black/40 bg-black p-2.5 shadow-inner sm:gap-2 sm:p-3">
              {(["x", "y", "z"] as ReelKey[]).map((key) => (
                <div
                  key={key}
                  className={
                    "flex h-14 w-20 items-center justify-center overflow-hidden rounded-lg bg-white px-1 text-xs font-bold leading-tight text-slate-900 shadow-[inset_0_3px_6px_rgba(0,0,0,0.25)] dark:bg-slate-950 dark:text-white sm:h-16 sm:w-24 sm:px-1.5 sm:text-sm " +
                    (landed[key] ? "reel-land" : "") +
                    " " +
                    (spinning ? "blur-[0.5px]" : "")
                  }
                >
                  <span
                    className={
                      !hasPulled || stale || (key === "y" && reelText(key) === "—")
                        ? "text-slate-300 dark:text-slate-700"
                        : ""
                    }
                  >
                    {reelText(key)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label="Pull the lever"
              onClick={() => pullLever()}
              disabled={spinning}
              className="group flex flex-col items-center gap-1 disabled:cursor-not-allowed"
            >
              <div className="relative h-16 w-5 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 shadow-inner sm:h-24 sm:w-6">
                <div
                  className={
                    "absolute left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow transition-transform duration-200 ease-out group-hover:from-red-500 group-hover:to-red-700 sm:h-7 sm:w-7 " +
                    (pulled ? "translate-y-11 sm:translate-y-16" : "translate-y-0")
                  }
                />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-amber-300/80">pull</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
              <span className="text-slate-400">Color</span>
              <input
                type="color"
                value={color}
                disabled={spinning}
                onChange={(e) => {
                  setColor(e.target.value);
                  setStale(true);
                }}
                className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              />
            </label>
            <button
              onClick={() => pullLever(randomHex())}
              disabled={spinning}
              className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Surprise me
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="w-full max-w-sm">
          <h2 className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Previously
          </h2>
          <ul className="flex flex-col gap-1.5">
            {history.map((entry, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-1.5 text-left text-sm transition hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-600"
              >
                <span
                  className="h-4 w-4 flex-none rounded-full border border-black/10"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-slate-300">{entry.name}</span>
                <span className="ml-auto font-mono text-xs text-slate-400 dark:text-slate-600">
                  {entry.color}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
