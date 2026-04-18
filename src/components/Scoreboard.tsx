import HintText from './HintText';
import type { ScoreEntry } from '../lib/scoreboard';

type Props = {
  entries: ScoreEntry[];
  /** The entry to highlight (e.g., the one the player just set). */
  highlight?: ScoreEntry;
  /** Suffix shown after the numeric score, e.g. "%" for percent-based games. */
  scoreSuffix?: string;
  /** Max entries to show. Defaults to 10. */
  max?: number;
  /** Optional title override (default: "High scores"). */
  title?: string;
  titleJa?: string;
};

export default function Scoreboard({
  entries,
  highlight,
  scoreSuffix = '',
  max = 10,
  title = 'High scores',
  titleJa = 'ハイスコア',
}: Props) {
  const shown = entries.slice(0, max);
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="font-semibold text-slate-800">{title}</p>
      <HintText ja={titleJa} />
      {shown.length === 0 ? (
        <p className="mt-2 text-slate-500 text-sm">No scores yet — be the first!</p>
      ) : (
        <ol className="mt-2 space-y-1">
          {shown.map((e, i) => {
            const isHighlight = !!highlight && e.ts === highlight.ts && e.name === highlight.name && e.score === highlight.score;
            return (
              <li
                key={`${e.ts}-${i}`}
                className={`flex justify-between items-baseline text-sm px-2 py-1 rounded ${isHighlight ? 'bg-emerald-50 font-semibold text-emerald-900' : ''}`}
              >
                <span className="flex items-baseline gap-2 min-w-0">
                  <span className="text-slate-400 tabular-nums w-5 text-right">{i + 1}.</span>
                  <span className="truncate">{e.name}</span>
                </span>
                <span className="tabular-nums ml-2 shrink-0">
                  {e.score}
                  {scoreSuffix}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
