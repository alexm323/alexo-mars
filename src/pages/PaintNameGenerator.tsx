import { useState } from "react";
import { generatePaintName } from "../lib/paintNames";

function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return "#" + n.toString(16).padStart(6, "0");
}

export default function PaintNameGenerator() {
  const [color, setColor] = useState("#8a5fd6");
  const [name, setName] = useState(() => generatePaintName("#8a5fd6", 0.42));
  const [history, setHistory] = useState<{ color: string; name: string }[]>([]);

  function reroll(nextColor = color) {
    const newName = generatePaintName(nextColor);
    setColor(nextColor);
    setName(newName);
    setHistory((h) => [{ color: nextColor, name: newName }, ...h].slice(0, 8));
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Paint Name Generator</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Pick a color, get a swatch-worthy name for it. 100% made up on the spot, just like the real thing.
        </p>
      </div>

      <div
        className="flex h-48 w-full max-w-sm items-end justify-center rounded-2xl border border-slate-200 p-6 shadow-sm transition-colors dark:border-slate-800"
        style={{ backgroundColor: color }}
      >
        <span className="rounded-md bg-white/90 px-3 py-1 text-lg font-semibold text-slate-900 shadow-sm dark:bg-slate-950/85 dark:text-white">
          {name}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <label className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => reroll(e.target.value)}
            className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <button
          onClick={() => reroll()}
          className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700"
        >
          New name, same color
        </button>
        <button
          onClick={() => reroll(randomHex())}
          className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
        >
          Surprise me
        </button>
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
                className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-1.5 text-left text-sm dark:border-slate-800"
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
