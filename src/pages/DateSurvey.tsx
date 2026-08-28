import { useState } from "react";
import { site } from "../content/site";

const RATING_LABELS = ["Not really", "It was okay", "Pretty good", "Great", "Amazing"];

type Answers = {
  rating: number | null;
  again: string;
  favorite: string;
  improve: string;
  notes: string;
};

const EMPTY: Answers = { rating: null, again: "", favorite: "", improve: "", notes: "" };

function buildSummary(a: Answers) {
  return [
    `Overall: ${a.rating ? `${a.rating}/5 — ${RATING_LABELS[a.rating - 1]}` : "(no rating)"}`,
    `Down for another date: ${a.again || "(no answer)"}`,
    `Favorite part: ${a.favorite || "(no answer)"}`,
    `Could be better: ${a.improve || "(no answer)"}`,
    `Anything else: ${a.notes || "(no answer)"}`,
  ].join("\n");
}

export default function DateSurvey() {
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSubmit = answers.rating !== null && answers.again !== "";

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  const summary = buildSummary(answers);
  const mailtoHref = `mailto:${site.email}?subject=${encodeURIComponent(
    "Date feedback",
  )}&body=${encodeURIComponent(summary)}`;

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select the text manually
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Thanks! 🎉</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Last step — actually get this to {site.name.split(" ")[0]}. Pick one:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={mailtoHref}
            className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            Send as email
          </a>
          <button
            onClick={copySummary}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
          >
            {copied ? "Copied!" : "Copy answers"}
          </button>
        </div>
        <pre className="mt-2 w-full whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {summary}
        </pre>
        <button
          onClick={() => {
            setAnswers(EMPTY);
            setSubmitted(false);
          }}
          className="text-sm text-slate-400 underline hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Date Survey</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Quick, honest, anonymous-if-you-want-it-to-be. Takes about 30 seconds.
        </p>
      </div>

      <form
        className="flex flex-col gap-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) setSubmitted(true);
        }}
      >
        <fieldset>
          <legend className="mb-2 font-medium text-slate-800 dark:text-slate-200">
            How was it, overall?
          </legend>
          <div className="flex justify-between gap-1">
            {RATING_LABELS.map((_, i) => {
              const value = i + 1;
              const active = answers.rating === value;
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => update("rating", value)}
                  className={
                    "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition " +
                    (active
                      ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-900/30 dark:text-violet-300"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400")
                  }
                >
                  {value}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">
            {answers.rating ? RATING_LABELS[answers.rating - 1] : "Pick a number, 1–5"}
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-medium text-slate-800 dark:text-slate-200">
            Down for another date?
          </legend>
          <div className="flex gap-2">
            {["Yes", "Maybe", "No"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => update("again", option)}
                className={
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition " +
                  (answers.again === option
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-900/30 dark:text-violet-300"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400")
                }
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-slate-800 dark:text-slate-200">One thing you liked</span>
          <textarea
            value={answers.favorite}
            onChange={(e) => update("favorite", e.target.value)}
            rows={2}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-800 dark:bg-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-slate-800 dark:text-slate-200">One thing that could be better</span>
          <textarea
            value={answers.improve}
            onChange={(e) => update("improve", e.target.value)}
            rows={2}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-800 dark:bg-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-slate-800 dark:text-slate-200">Anything else? (optional)</span>
          <textarea
            value={answers.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-800 dark:bg-slate-900"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Review answers
        </button>
      </form>
    </div>
  );
}
