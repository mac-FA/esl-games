import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../components/GameShell';
import Button from '../../components/Button';
import HintText from '../../components/HintText';
import Scoreboard from '../../components/Scoreboard';
import { shuffle } from '../../lib/shuffle';
import { useUser } from '../../lib/user-context';
import { addScore, loadScoreboard, type ScoreEntry } from '../../lib/scoreboard';
import { fetchRemoteTop, submitRemoteScore } from '../../lib/remote-scoreboard';
import { TEXTS, parseBody, type SpeedFindText, type SpeedFindKind } from '../../content/speedfind';
import { GAME_BG } from '../../lib/game-bg';
import { sfx } from '../../lib/sfx';

const SCORES_KEY = 'speedfind:scoreboard';
const ROUND_MS = 30_000;
const WRONG_PENALTY_MS = 3_000;

type Phase = 'intro' | 'playing' | 'results';

type LogEntry = {
  id: string;
  question: string;
  correct: boolean;
  wrongTaps: number;
};

export default function SpeedFind() {
  const navigate = useNavigate();
  const { name } = useUser();
  const [phase, setPhase] = useState<Phase>('intro');
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScoreboard(SCORES_KEY));
  const [justAdded, setJustAdded] = useState<ScoreEntry | undefined>(undefined);

  const [order, setOrder] = useState<SpeedFindText[]>([]);
  const [orderIdx, setOrderIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongTapsThisText, setWrongTapsThisText] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [lastTap, setLastTap] = useState<{ idx: number; correct: boolean } | null>(null);

  const roundStartRef = useRef<number>(0);
  const penaltyRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('intro');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRemoteTop(SCORES_KEY).then((remote) => {
      if (!cancelled && remote) setScores(remote);
    });
    return () => { cancelled = true; };
  }, []);

  function startRound() {
    const o = shuffle(TEXTS);
    setOrder(o);
    setOrderIdx(0);
    setScore(0);
    setWrongTapsThisText(0);
    setLog([]);
    setTimeLeft(ROUND_MS);
    setLastTap(null);
    setJustAdded(undefined);
    roundStartRef.current = performance.now();
    penaltyRef.current = 0;
    setPhase('playing');
    rafRef.current = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    if (phaseRef.current !== 'playing') return;
    const elapsed = now - roundStartRef.current + penaltyRef.current;
    const left = Math.max(0, ROUND_MS - elapsed);
    setTimeLeft(left);
    if (left <= 0) {
      endRound();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function endRound() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPhase('results');
    setScore((s) => {
      if (s > 0 && name) {
        const entry: ScoreEntry = { name, score: s, ts: Date.now() };
        const { list } = addScore(SCORES_KEY, entry);
        setScores(list);
        setJustAdded(entry);
        submitRemoteScore(SCORES_KEY, entry).then((remote) => {
          if (remote) setScores(remote);
        });
      }
      sfx(s >= 10 ? 'win' : 'fail');
      return s;
    });
  }

  function onWordTap(tokenIdx: number, isTarget: boolean, entry: SpeedFindText) {
    if (phase !== 'playing') return;
    setLastTap({ idx: tokenIdx, correct: isTarget });
    if (isTarget) {
      // correct
      setScore((s) => s + 1);
      setLog((l) => [
        ...l,
        { id: entry.id, question: entry.question, correct: true, wrongTaps: wrongTapsThisText },
      ]);
      sfx('correct');
      advance();
    } else {
      // wrong: -3s
      penaltyRef.current += WRONG_PENALTY_MS;
      setWrongTapsThisText((w) => w + 1);
      sfx('wrong');
    }
  }

  function skip(entry: SpeedFindText) {
    setLog((l) => [
      ...l,
      { id: entry.id, question: entry.question, correct: false, wrongTaps: wrongTapsThisText },
    ]);
    advance();
  }

  function advance() {
    setWrongTapsThisText(0);
    setLastTap(null);
    setOrderIdx((i) => {
      const next = i + 1;
      if (next >= order.length) {
        // Completed all 20 before timer ran out: end now.
        endRound();
        return i;
      }
      return next;
    });
  }

  function goHome() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    navigate('/');
  }

  // ---------- render ----------
  if (phase === 'intro') {
    return (
      <GameShell title="Speed Find" titleJa="スピード・サーチ" bg={GAME_BG.speedfind}>
        <p className="text-lg text-slate-700">
          Read a menu, email, flyer, or card. <b>Tap the word</b> that answers the question.
        </p>
        <HintText ja="メニュー・メール・チラシ・カードを読んで、答えの単語をタップしましょう。" />
        <ul className="mt-4 space-y-1 text-slate-600">
          <li>• 30 seconds total</li>
          <li>• Wrong tap = <b>−3 seconds</b></li>
          <li>• Score = correct answers</li>
        </ul>
        <div className="mt-6">
          <Button size="lg" onClick={startRound} variant="primary">Start</Button>
        </div>
        <Scoreboard entries={scores} />
      </GameShell>
    );
  }

  if (phase === 'results') {
    return <Results score={score} scores={scores} highlight={justAdded} log={log} onAgain={startRound} onHome={goHome} />;
  }

  // playing
  const entry = order[orderIdx];
  if (!entry) return null;

  return (
    <GameShell title="Speed Find" titleJa="スピード・サーチ" bg={GAME_BG.speedfind}>
      <HUD score={score} timeLeft={timeLeft} total={order.length} idx={orderIdx} />
      <Question entry={entry} />
      <TextCard
        entry={entry}
        onWordTap={(tokenIdx, isTarget) => onWordTap(tokenIdx, isTarget, entry)}
        lastTap={lastTap}
      />
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-slate-500">Wrong taps this card: {wrongTapsThisText}</span>
        <Button size="md" onClick={() => skip(entry)} variant="ghost">Skip</Button>
      </div>
    </GameShell>
  );
}

function HUD({ score, timeLeft, total, idx }: { score: number; timeLeft: number; total: number; idx: number }) {
  const seconds = Math.ceil(timeLeft / 1000);
  const pct = (timeLeft / ROUND_MS) * 100;
  const low = timeLeft < 8000;
  return (
    <>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900">Score: {score}</span>
        <span className="text-slate-500">{idx + 1} / {total}</span>
        <span className={`font-mono ${low ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{seconds}s</span>
      </div>
      <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-[width] duration-100 ${low ? 'bg-rose-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </>
  );
}

function Question({ entry }: { entry: SpeedFindText }) {
  return (
    <div className="mt-4">
      <p className="text-lg font-semibold text-slate-900">{entry.question}</p>
      {entry.questionJa && <HintText ja={entry.questionJa} />}
    </div>
  );
}

function kindStyles(kind: SpeedFindKind): string {
  switch (kind) {
    case 'menu':
      return 'bg-amber-50 border-amber-200 font-mono';
    case 'timetable':
      return 'bg-slate-50 border-slate-300 font-mono';
    case 'email':
      return 'bg-white border-slate-200';
    case 'flyer':
      return 'bg-pink-50 border-pink-200';
    case 'card':
      return 'bg-indigo-50 border-indigo-200';
  }
}

function TextCard({
  entry,
  onWordTap,
  lastTap,
}: {
  entry: SpeedFindText;
  onWordTap: (tokenIdx: number, isTarget: boolean) => void;
  lastTap: { idx: number; correct: boolean } | null;
}) {
  const parsed = useMemo(() => parseBody(entry.body), [entry]);
  const styles = kindStyles(entry.kind);
  return (
    <div className={`mt-3 rounded-2xl border p-4 shadow-sm ${styles}`}>
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{entry.kind} · {entry.title}</p>
      <div className="text-lg leading-relaxed">
        {parsed.tokens.map((t, k) => {
          if (t.kind === 'newline') return <br key={k} />;
          if (t.kind === 'space') return <span key={k}>{t.text}</span>;
          const isLast = lastTap && lastTap.idx === t.index;
          const flash =
            isLast && !lastTap!.correct
              ? 'bg-rose-200 ring-2 ring-rose-400'
              : '';
          return (
            <button
              key={k}
              type="button"
              onClick={() => onWordTap(t.index, t.isTarget)}
              className={`inline-block px-1 py-0.5 rounded-md active:scale-[0.95] transition hover:bg-blue-100 ${flash}`}
              aria-label={`Tap if this answers the question: ${t.text}`}
            >
              {t.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Results({
  score,
  scores,
  highlight,
  log,
  onAgain,
  onHome,
}: {
  score: number;
  scores: ScoreEntry[];
  highlight?: ScoreEntry;
  log: LogEntry[];
  onAgain: () => void;
  onHome: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const madeBoard = !!highlight;
  const topScore = scores[0]?.score ?? 0;
  const newBest = madeBoard && score === topScore;
  const attempted = log.length;
  return (
    <GameShell title="Speed Find" titleJa="スピード・サーチ" bg={GAME_BG.speedfind}>
      <div ref={ref} className={`mt-2 rounded-2xl border p-5 ${newBest ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <p className="text-2xl font-bold">
          {newBest ? 'New best!' : "Time's up"} <span className="text-slate-700 font-semibold">— {score} correct</span>
        </p>
        <HintText ja={newBest ? '最高記録です！' : 'よくやりました！'} />
        <p className="mt-1 text-slate-700">Attempted: {attempted}</p>
      </div>
      <Scoreboard entries={scores} highlight={highlight} />
      {log.length > 0 && (
        <div className="mt-5">
          <p className="font-semibold text-slate-800">Review</p>
          <HintText ja="結果" />
          <ul className="mt-2 space-y-2">
            {log.map((e, i) => (
              <li
                key={i}
                className={`rounded-xl border p-3 ${e.correct ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
              >
                <p className="text-sm">
                  <span className={`font-semibold ${e.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {e.correct ? '✓' : '✗ skipped'}
                  </span>{' '}
                  {e.question}
                  {e.wrongTaps > 0 && (
                    <span className="ml-2 text-slate-500">({e.wrongTaps} wrong {e.wrongTaps === 1 ? 'tap' : 'taps'})</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex gap-3 flex-wrap">
        <Button size="lg" onClick={onAgain} variant="primary">Play again</Button>
        <Button size="lg" onClick={onHome} variant="ghost">Back to games</Button>
      </div>
    </GameShell>
  );
}
