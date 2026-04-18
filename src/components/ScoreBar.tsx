type Props = {
  score: number;
  progress?: { current: number; total: number };
  best?: number;
  className?: string;
};

export default function ScoreBar({ score, progress, best, className = '' }: Props) {
  const pct = progress ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : null;
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-baseline justify-between gap-4 text-sm sm:text-base">
        <div>
          <span className="text-slate-500">Score</span>{' '}
          <span className="font-bold text-slate-900 text-lg">{score}</span>
        </div>
        {progress && (
          <div className="text-slate-500">
            {progress.current} / {progress.total}
          </div>
        )}
        {best != null && (
          <div className="text-slate-500">
            Best <span className="font-semibold text-slate-700">{best}</span>
          </div>
        )}
      </div>
      {pct != null && (
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
