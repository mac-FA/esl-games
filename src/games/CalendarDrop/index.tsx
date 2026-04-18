import { useEffect, useMemo, useRef, useState } from 'react';
import GameShell from '../../components/GameShell';
import Button from '../../components/Button';
import HintText from '../../components/HintText';
import { loadJSON, saveJSON } from '../../lib/storage';
import { shuffle } from '../../lib/shuffle';
import { ITEMS, type CalendarItem, type CalendarPrep } from '../../content/calendar';

const BEST_KEY = 'calendar:best';
const ROUND_MS = 60_000;
const START_FALL_MS = 4200; // first card falls this slowly
const END_FALL_MS = 2100; // ...and this fast near the end

type Phase = 'intro' | 'playing' | 'results';

type LogEntry = {
  itemId: string;
  text: string;
  expected: CalendarPrep;
  chosen: CalendarPrep | 'miss';
  correct: boolean;
};

type Flash = { kind: 'right' | 'wrong' | 'miss'; text: string; note?: string } | null;

// Linear-interp between the slow start duration and the fast end duration.
function fallDurationForElapsed(elapsedMs: number): number {
  const t = Math.min(1, elapsedMs / ROUND_MS);
  return START_FALL_MS + (END_FALL_MS - START_FALL_MS) * t;
}

export default function CalendarDrop() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [best, setBest] = useState<number>(() => loadJSON<number>(BEST_KEY, 0));

  // Round state
  const [, setQueue] = useState<CalendarItem[]>([]);
  const [current, setCurrent] = useState<CalendarItem | null>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [flash, setFlash] = useState<Flash>(null);

  // Animation state: y in px, fallDurationMs for the current card, roundElapsedMs for the timer
  const [roundElapsed, setRoundElapsed] = useState(0);
  const [yPx, setYPx] = useState(0);

  const fieldRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const roundStartRef = useRef<number>(0);
  const cardStartRef = useRef<number>(0);
  const cardDurationRef = useRef<number>(START_FALL_MS);
  const fieldHeightRef = useRef<number>(0);
  const queueRef = useRef<CalendarItem[]>([]);
  const phaseRef = useRef<Phase>('intro');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---------- lifecycle ----------
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function startRound() {
    const q = shuffle(ITEMS);
    queueRef.current = q;
    setQueue(q);
    setScore(0);
    setMisses(0);
    setStreak(0);
    setBestStreak(0);
    setLog([]);
    setFlash(null);
    setRoundElapsed(0);
    setYPx(0);
    setPhase('playing');
    roundStartRef.current = performance.now();
    cardStartRef.current = performance.now();
    cardDurationRef.current = START_FALL_MS;
    // Spawn first card
    const first = q[0];
    setCurrent(first);
    queueRef.current = q.slice(1);
    setQueue(queueRef.current);
    // Start rAF loop
    rafRef.current = requestAnimationFrame(tick);
  }

  function spawnNext() {
    // Refill queue if empty (rare for a 60s round, but safe).
    if (queueRef.current.length === 0) {
      queueRef.current = shuffle(ITEMS);
    }
    const nxt = queueRef.current[0];
    queueRef.current = queueRef.current.slice(1);
    setQueue(queueRef.current);
    setCurrent(nxt);
    setYPx(0);
    cardStartRef.current = performance.now();
    cardDurationRef.current = fallDurationForElapsed(performance.now() - roundStartRef.current);
  }

  function tick(now: number) {
    if (phaseRef.current !== 'playing') return;
    const elapsed = now - roundStartRef.current;
    setRoundElapsed(elapsed);

    if (elapsed >= ROUND_MS) {
      endRound();
      return;
    }

    const h = fieldHeightRef.current || (fieldRef.current?.clientHeight ?? 360);
    fieldHeightRef.current = h;
    const travel = h - 88; // leave room so card sits above bins when it "lands"
    const t = Math.min(1, (now - cardStartRef.current) / cardDurationRef.current);
    setYPx(Math.max(0, travel) * t);

    if (t >= 1) {
      // Miss
      handleMiss();
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  function handleMiss() {
    if (!current) return;
    setMisses((m) => m + 1);
    setStreak(0);
    setFlash({ kind: 'miss', text: `in/on/at ${current.text}`, note: current.note });
    setLog((l) => [
      ...l,
      { itemId: current.id, text: current.text, expected: current.prep, chosen: 'miss', correct: false },
    ]);
    window.setTimeout(() => setFlash(null), 700);
    spawnNext();
  }

  function choose(prep: CalendarPrep) {
    if (!current || phase !== 'playing') return;
    const correct = current.prep === prep;
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setFlash({ kind: 'right', text: `${prep} ${current.text}` });
    } else {
      setStreak(0);
      setFlash({ kind: 'wrong', text: `${current.prep} ${current.text}`, note: current.note });
    }
    setLog((l) => [
      ...l,
      { itemId: current.id, text: current.text, expected: current.prep, chosen: prep, correct },
    ]);
    window.setTimeout(() => setFlash(null), correct ? 500 : 900);
    spawnNext();
  }

  function endRound() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPhase('results');
    setCurrent(null);
    setScore((finalScore) => {
      if (finalScore > best) {
        setBest(finalScore);
        saveJSON(BEST_KEY, finalScore);
      }
      return finalScore;
    });
  }

  function backToIntro() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPhase('intro');
    setCurrent(null);
  }

  // ---------- render ----------
  if (phase === 'intro') {
    return (
      <GameShell title="Calendar Drop" titleJa="カレンダー・ドロップ">
        <p className="text-lg text-slate-700">
          Time expressions fall from the top. Tap <b>in</b>, <b>on</b>, or <b>at</b> before they land.
        </p>
        <HintText ja="時の表現が上から落ちてきます。下に届く前に in / on / at をタップしましょう。" />
        <ul className="mt-4 space-y-1 text-slate-600">
          <li>• <b>in</b> — months, years, seasons, morning / afternoon / evening</li>
          <li>• <b>on</b> — days and dates</li>
          <li>• <b>at</b> — clock times, night, mealtimes</li>
        </ul>
        <p className="mt-3 text-slate-600">60 seconds. Cards speed up. Best score is saved.</p>
        {best > 0 && <p className="text-slate-600 mt-2">Your best: {best}</p>}
        <div className="mt-6">
          <Button size="lg" onClick={startRound} variant="primary">Start</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'results') {
    return <Results log={log} score={score} misses={misses} bestStreak={bestStreak} best={best} onAgain={startRound} onHome={backToIntro} />;
  }

  // playing
  const timeLeft = Math.max(0, ROUND_MS - roundElapsed);
  const timeLeftS = Math.ceil(timeLeft / 1000);
  const timeFrac = timeLeft / ROUND_MS;

  return (
    <GameShell title="Calendar Drop" titleJa="カレンダー・ドロップ">
      {/* HUD */}
      <div className="mt-1 flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">Score: {score}</span>
          <span className="text-slate-500">Streak: {streak}</span>
        </div>
        <span className="font-mono text-slate-700" aria-label={`${timeLeftS} seconds left`}>{timeLeftS}s</span>
      </div>
      <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-[width] duration-100"
          style={{ width: `${timeFrac * 100}%` }}
        />
      </div>

      {/* Field */}
      <div
        ref={fieldRef}
        className="relative mt-4 h-[46vh] min-h-[320px] rounded-2xl border border-slate-200 bg-white overflow-hidden"
      >
        {current && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: yPx }}
          >
            <div className="px-5 py-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm text-xl font-semibold text-slate-900 whitespace-nowrap">
              {current.text}
            </div>
          </div>
        )}

        {/* Flash */}
        {flash && (
          <div
            role="status"
            aria-live="polite"
            className={`absolute inset-x-0 bottom-3 mx-auto w-fit px-4 py-2 rounded-xl text-sm font-semibold shadow-sm
              ${flash.kind === 'right' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : ''}
              ${flash.kind === 'wrong' ? 'bg-rose-100 text-rose-900 border border-rose-200' : ''}
              ${flash.kind === 'miss' ? 'bg-amber-100 text-amber-900 border border-amber-200' : ''}`}
          >
            {flash.kind === 'right' ? '✓ ' : flash.kind === 'wrong' ? '✗ ' : '⏱ '}
            {flash.text}
            {flash.note && <span className="ml-2 font-normal text-slate-700">— {flash.note}</span>}
          </div>
        )}
      </div>

      {/* Bins */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <BinButton label="in" color="sky" onClick={() => choose('in')} />
        <BinButton label="on" color="violet" onClick={() => choose('on')} />
        <BinButton label="at" color="amber" onClick={() => choose('at')} />
      </div>

      <div className="mt-4 flex justify-end">
        <Button size="md" onClick={backToIntro} variant="ghost">Give up</Button>
      </div>
    </GameShell>
  );
}

function BinButton({ label, color, onClick }: { label: string; color: 'sky' | 'violet' | 'amber'; onClick: () => void }) {
  const palette: Record<string, string> = {
    sky: 'bg-sky-50 border-sky-300 text-sky-900 active:bg-sky-100',
    violet: 'bg-violet-50 border-violet-300 text-violet-900 active:bg-violet-100',
    amber: 'bg-amber-50 border-amber-300 text-amber-900 active:bg-amber-100',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[64px] rounded-2xl border-2 text-2xl font-bold active:scale-[0.98] transition ${palette[color]}`}
      aria-label={`Classify as ${label}`}
    >
      {label}
    </button>
  );
}

function Results({
  log,
  score,
  misses,
  bestStreak,
  best,
  onAgain,
  onHome,
}: {
  log: LogEntry[];
  score: number;
  misses: number;
  bestStreak: number;
  best: number;
  onAgain: () => void;
  onHome: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const breakdown = useMemo(() => {
    const acc: Record<CalendarPrep, { correct: number; total: number }> = {
      in: { correct: 0, total: 0 },
      on: { correct: 0, total: 0 },
      at: { correct: 0, total: 0 },
    };
    log.forEach((e) => {
      acc[e.expected].total += 1;
      if (e.correct) acc[e.expected].correct += 1;
    });
    return acc;
  }, [log]);

  const wrongs = log.filter((e) => !e.correct);

  const newBest = score > 0 && score >= best;

  return (
    <GameShell title="Calendar Drop" titleJa="カレンダー・ドロップ">
      <div ref={ref} className={`mt-2 rounded-2xl border p-5 ${newBest ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <p className="text-2xl font-bold">
          {newBest ? 'New best!' : 'Round over'}{' '}
          <span className="text-slate-700 font-semibold">— {score} correct</span>
        </p>
        <HintText ja={newBest ? '最高記録です！' : 'おつかれさまでした！'} />
        <p className="mt-1 text-slate-700">
          Misses: {misses} · Best streak: {bestStreak} · All-time best: {Math.max(best, score)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {(['in', 'on', 'at'] as CalendarPrep[]).map((p) => (
          <div key={p} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-sm uppercase tracking-wider text-slate-500">{p}</p>
            <p className="mt-1 text-xl font-bold">{breakdown[p].correct} / {breakdown[p].total}</p>
          </div>
        ))}
      </div>

      {wrongs.length > 0 && (
        <div className="mt-5">
          <p className="font-semibold text-slate-800">Review</p>
          <HintText ja="間違えた問題" />
          <ul className="mt-2 space-y-2">
            {wrongs.slice(0, 10).map((e, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                <p>
                  <span className="font-semibold text-emerald-700">{e.expected}</span>{' '}
                  <span>{e.text}</span>
                  <span className="ml-2 text-sm text-slate-500">
                    (you: {e.chosen === 'miss' ? 'missed' : e.chosen})
                  </span>
                </p>
              </li>
            ))}
          </ul>
          {wrongs.length > 10 && (
            <p className="text-sm text-slate-500 mt-2">…and {wrongs.length - 10} more.</p>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-3 flex-wrap">
        <Button size="lg" onClick={onAgain} variant="primary">Play again</Button>
        <Button size="lg" onClick={onHome} variant="ghost">Back to games</Button>
      </div>
    </GameShell>
  );
}
