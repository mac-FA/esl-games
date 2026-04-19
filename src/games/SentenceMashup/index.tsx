import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../components/GameShell';
import Button from '../../components/Button';
import ScoreBar from '../../components/ScoreBar';
import HintText from '../../components/HintText';
import Scoreboard from '../../components/Scoreboard';
import { useHints } from '../../lib/hint-context';
import { loadJSON, saveJSON, removeKey } from '../../lib/storage';
import { shuffle } from '../../lib/shuffle';
import { useUser } from '../../lib/user-context';
import { addScore, loadScoreboard, type ScoreEntry } from '../../lib/scoreboard';
import { fetchRemoteTop, submitRemoteScore } from '../../lib/remote-scoreboard';
import { GAME_BG } from '../../lib/game-bg';
import { sfx } from '../../lib/sfx';
import {
  PAIRS,
  CONJUNCTIONS,
  combineClause,
  correctnessFor,
  explainFor,
  type Conjunction,
  type Correctness,
  type MashupPair,
} from '../../content/mashup';

const ROUND_SIZE = 10;
const RESUME_KEY = 'mashup:state';
const SCORES_KEY = 'mashup:scoreboard';
const PER_PAIR_MS = 8000;

type Answer = { id: string; picked: Conjunction | null; correctness: Correctness };

type SavedState = {
  pairIds: string[];
  idx: number;
  answers: Answer[];
  pickedConj: Conjunction | null;
};

type Phase = 'intro' | 'resume' | 'playing' | 'results';

type Breakdown = Record<Conjunction, { best: number; acceptable: number; wrong: number; total: number }>;

const emptyBreakdown = (): Breakdown => ({
  and: { best: 0, acceptable: 0, wrong: 0, total: 0 },
  but: { best: 0, acceptable: 0, wrong: 0, total: 0 },
  because: { best: 0, acceptable: 0, wrong: 0, total: 0 },
  so: { best: 0, acceptable: 0, wrong: 0, total: 0 },
});

function computeBreakdown(pairs: MashupPair[], answers: Answer[]): Breakdown {
  const bd = emptyBreakdown();
  pairs.forEach((p, i) => {
    bd[p.best].total += 1;
    const ans = answers[i];
    if (!ans) return;
    bd[p.best][ans.correctness] += 1;
  });
  return bd;
}

function computeScore(answers: Answer[]): number {
  return answers.reduce((n, a) => n + (a.correctness === 'best' ? 1 : a.correctness === 'acceptable' ? 1 : 0), 0);
}

function pickRound(): MashupPair[] {
  // Balance: ~2–3 per conjunction if possible, then fill random.
  const byConj: Record<Conjunction, MashupPair[]> = { and: [], but: [], because: [], so: [] };
  PAIRS.forEach((p) => byConj[p.best].push(p));
  const out: MashupPair[] = [];
  const perConj = Math.floor(ROUND_SIZE / CONJUNCTIONS.length); // 2
  CONJUNCTIONS.forEach((c) => {
    out.push(...shuffle(byConj[c]).slice(0, perConj));
  });
  const remaining = PAIRS.filter((p) => !out.includes(p));
  out.push(...shuffle(remaining).slice(0, ROUND_SIZE - out.length));
  return shuffle(out);
}

export default function SentenceMashup() {
  const navigate = useNavigate();
  const { hintsOn } = useHints();
  const { name } = useUser();
  const [phase, setPhase] = useState<Phase>('intro');
  const [pairs, setPairs] = useState<MashupPair[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [pickedConj, setPickedConj] = useState<Conjunction | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScoreboard(SCORES_KEY));
  const [justAdded, setJustAdded] = useState<ScoreEntry | undefined>(undefined);

  // Per-pair timer: runs only while the learner is picking (pickedConj == null
  // and not already timed out). Feedback/review time is untimed.
  useEffect(() => {
    if (phase !== 'playing') return;
    if (pickedConj != null || timedOut) return;
    const id = window.setTimeout(() => {
      const pair = pairs[idx];
      if (!pair) return;
      setTimedOut(true);
      setAnswers((prev) => [...prev, { id: pair.id, picked: null, correctness: 'wrong' }]);
      sfx('wrong');
    }, PER_PAIR_MS);
    return () => window.clearTimeout(id);
  }, [phase, pickedConj, timedOut, idx, pairs]);

  // On mount: pull shared scoreboard from the remote backend (if configured).
  useEffect(() => {
    let cancelled = false;
    fetchRemoteTop(SCORES_KEY).then((remote) => {
      if (!cancelled && remote) setScores(remote);
    });
    return () => { cancelled = true; };
  }, []);

  // On mount: check for saved in-progress round.
  useEffect(() => {
    const saved = loadJSON<SavedState | null>(RESUME_KEY, null);
    if (saved && saved.pairIds?.length === ROUND_SIZE && saved.idx < ROUND_SIZE) {
      const restored = saved.pairIds.map((id) => PAIRS.find((p) => p.id === id)).filter(Boolean) as MashupPair[];
      if (restored.length === ROUND_SIZE) {
        setPairs(restored);
        setIdx(saved.idx);
        setAnswers(saved.answers ?? []);
        setPickedConj(saved.pickedConj ?? null);
        setPhase('resume');
        return;
      }
    }
    setPhase('intro');
  }, []);

  // Persist in-progress state.
  useEffect(() => {
    if (phase !== 'playing') return;
    const state: SavedState = {
      pairIds: pairs.map((p) => p.id),
      idx,
      answers,
      pickedConj,
    };
    saveJSON(RESUME_KEY, state);
  }, [phase, pairs, idx, answers, pickedConj]);

  function startNew() {
    const round = pickRound();
    setPairs(round);
    setIdx(0);
    setAnswers([]);
    setPickedConj(null);
    setTimedOut(false);
    setPhase('playing');
  }

  function continueRound() {
    setPhase('playing');
  }

  function pickConjunction(conj: Conjunction) {
    if (pickedConj || timedOut) return;
    setPickedConj(conj);
    const pair = pairs[idx];
    const correctness = correctnessFor(pair, conj);
    setAnswers((prev) => [...prev, { id: pair.id, picked: conj, correctness }]);
    sfx(correctness === 'best' ? 'correct' : correctness === 'acceptable' ? 'pick' : 'wrong');
  }

  function next() {
    if (idx + 1 >= ROUND_SIZE) {
      // Finish round.
      const finalScore = computeScore(answers);
      if (finalScore > 0 && name) {
        const entry: ScoreEntry = { name, score: finalScore, ts: Date.now() };
        const { list } = addScore(SCORES_KEY, entry);
        setScores(list);
        setJustAdded(entry);
        submitRemoteScore(SCORES_KEY, entry).then((remote) => {
          if (remote) setScores(remote);
        });
      }
      removeKey(RESUME_KEY);
      setPhase('results');
      sfx(finalScore >= Math.ceil(ROUND_SIZE * 0.7) ? 'win' : 'fail');
    } else {
      setIdx(idx + 1);
      setPickedConj(null);
      setTimedOut(false);
    }
  }

  function goHome() {
    removeKey(RESUME_KEY);
    navigate('/');
  }

  // ---------------- render ----------------
  if (phase === 'intro') {
    return (
      <GameShell title="Sentence Mashup" titleJa="文つなぎ" bg={GAME_BG.mashup}>
        <p className="text-lg text-slate-700">
          Join the two sentences with the best word: <b>and</b>, <b>but</b>, <b>because</b>, or <b>so</b>.
        </p>
        <HintText ja="二つの文を、and（そして）／but（しかし）／because（なぜなら）／so（だから）のどれかでつなげましょう。" />
        <p className="text-slate-600 mt-2">10 pairs · <b>8 seconds</b> each.</p>
        <div className="mt-6">
          <Button size="lg" onClick={startNew} variant="primary">Start</Button>
        </div>
        <Scoreboard entries={scores} scoreSuffix={` / ${ROUND_SIZE}`} />
      </GameShell>
    );
  }

  if (phase === 'resume') {
    return (
      <GameShell title="Sentence Mashup" titleJa="文つなぎ" bg={GAME_BG.mashup}>
        <p className="text-lg text-slate-700">You have a round in progress.</p>
        <HintText ja="途中のゲームがあります。続けますか？" />
        <div className="flex gap-3 mt-6 flex-wrap">
          <Button size="lg" onClick={continueRound} variant="primary">Continue</Button>
          <Button size="lg" onClick={() => { removeKey(RESUME_KEY); startNew(); }} variant="secondary">
            Start over
          </Button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'results') {
    return (
      <Results
        pairs={pairs}
        answers={answers}
        scores={scores}
        highlight={justAdded}
        onRestart={startNew}
        onHome={goHome}
        hintsOn={hintsOn}
      />
    );
  }

  // playing
  const pair = pairs[idx];
  const correctness = pickedConj ? correctnessFor(pair, pickedConj) : null;
  const picking = !pickedConj && !timedOut;
  const showCombined = pickedConj != null;
  return (
    <GameShell title="Sentence Mashup" titleJa="文つなぎ" bg={GAME_BG.mashup}>
      <ScoreBar
        score={computeScore(answers)}
        progress={{ current: idx + (pickedConj || timedOut ? 1 : 0), total: ROUND_SIZE }}
        best={scores[0]?.score || undefined}
        className="mb-4"
      />

      <CountdownBar active={picking} resetKey={idx} durationMs={PER_PAIR_MS} />

      <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        {!showCombined ? (
          <div className="space-y-4">
            <p className="text-2xl leading-snug">{pair.a}</p>
            <p className="text-center text-slate-400 text-sm tracking-widest">+ ? +</p>
            <p className="text-2xl leading-snug">{pair.b}</p>
          </div>
        ) : (
          <div
            className={`text-2xl leading-snug transition
              ${correctness === 'best' ? 'text-emerald-700' : ''}
              ${correctness === 'acceptable' ? 'text-amber-700' : ''}
              ${correctness === 'wrong' ? 'text-rose-700' : ''}`}
          >
            {combineClause(pair.a, pair.b, pickedConj!)}
          </div>
        )}
      </section>

      {picking && (
        <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-4">
          {CONJUNCTIONS.map((c) => (
            <Button key={c} size="lg" variant="secondary" onClick={() => pickConjunction(c)}>
              {c}
            </Button>
          ))}
        </div>
      )}
      {timedOut && (
        <TimeoutPanel pair={pair} onNext={next} isLast={idx + 1 >= ROUND_SIZE} />
      )}
      {pickedConj && (
        <FeedbackPanel
          pair={pair}
          picked={pickedConj}
          correctness={correctness!}
          onNext={next}
          isLast={idx + 1 >= ROUND_SIZE}
        />
      )}
    </GameShell>
  );
}

/** Thin 5s countdown bar. Uses CSS animation keyed on `resetKey` so each new
 *  pair re-triggers the 100%→0% sweep without per-frame React state. */
function CountdownBar({ active, resetKey, durationMs }: { active: boolean; resetKey: number | string; durationMs: number }) {
  return (
    <div className="mb-3 h-1.5 bg-slate-100 rounded-full overflow-hidden" aria-hidden>
      <div
        key={resetKey}
        className={active ? 'h-full bg-blue-500' : 'h-full bg-slate-300'}
        style={
          active
            ? { animation: `mashup-countdown ${durationMs}ms linear forwards` }
            : { width: '0%' }
        }
      />
      <style>{`@keyframes mashup-countdown { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
}

function TimeoutPanel({ pair, onNext, isLast }: { pair: MashupPair; onNext: () => void; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  return (
    <>
      <div
        ref={ref}
        className="mt-5 rounded-2xl border p-4 bg-rose-50 border-rose-200 text-rose-900"
        role="status"
        aria-live="polite"
      >
        <p className="font-semibold">⏱ Time's up</p>
        <HintText ja="時間切れです。" className="text-inherit" />
        <p className="mt-2 text-sm">
          Best answer: <b>{pair.best}</b>
        </p>
        <p className="mt-1 text-base">{combineClause(pair.a, pair.b, pair.best)}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onNext} variant="primary">
          {isLast ? 'See results' : 'Next'}
        </Button>
      </div>
    </>
  );
}

function FeedbackPanel({
  pair,
  picked,
  correctness,
  onNext,
  isLast,
}: {
  pair: MashupPair;
  picked: Conjunction;
  correctness: Correctness;
  onNext: () => void;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  const color =
    correctness === 'best'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
      : correctness === 'acceptable'
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-rose-50 border-rose-200 text-rose-900';

  const label =
    correctness === 'best' ? 'Natural ✓' : correctness === 'acceptable' ? 'Works, but not the most natural' : 'Try again next time';

  const labelJa =
    correctness === 'best' ? '自然です' : correctness === 'acceptable' ? '使えますが、一番自然ではありません' : '次は違うのを試してみましょう';

  return (
    <>
      <div ref={ref} className={`mt-5 rounded-2xl border p-4 ${color}`} role="status" aria-live="polite">
        <p className="font-semibold">{label}</p>
        <HintText ja={labelJa} className="text-inherit" />
        <p className="mt-2 text-base">{explainFor(pair, picked)}</p>
        {correctness !== 'best' && (
          <p className="mt-2 text-sm">
            Best answer: <b>{pair.best}</b>
          </p>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onNext} variant="primary">
          {isLast ? 'See results' : 'Next'}
        </Button>
      </div>
    </>
  );
}

function Results({
  pairs,
  answers,
  scores,
  highlight,
  onRestart,
  onHome,
  hintsOn,
}: {
  pairs: MashupPair[];
  answers: Answer[];
  scores: ScoreEntry[];
  highlight?: ScoreEntry;
  onRestart: () => void;
  onHome: () => void;
  hintsOn: boolean;
}) {
  const score = computeScore(answers);
  const breakdown = useMemo(() => computeBreakdown(pairs, answers), [pairs, answers]);
  const hardest = CONJUNCTIONS
    .map((c) => ({ c, total: breakdown[c].total, hits: breakdown[c].best + breakdown[c].acceptable }))
    .filter((x) => x.total > 0)
    .sort((a, b) => a.hits / a.total - b.hits / b.total)[0];

  return (
    <GameShell title="Sentence Mashup" titleJa="文つなぎ" bg={GAME_BG.mashup}>
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-sm">
        <p className="text-sm uppercase tracking-wider text-slate-500">Round complete</p>
        <p className="text-5xl font-bold mt-2">
          {score} / {pairs.length}
        </p>
        {hintsOn && <p className="text-slate-500 mt-1">おつかれさまでした！</p>}
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <p className="font-semibold">By conjunction</p>
        <HintText ja="接続詞ごとの正解率" />
        <ul className="mt-3 space-y-1 text-slate-700">
          {CONJUNCTIONS.map((c) => {
            const b = breakdown[c];
            if (b.total === 0) return null;
            const hits = b.best + b.acceptable;
            return (
              <li key={c} className="flex justify-between">
                <span className="font-medium">{c}</span>
                <span>
                  {hits} / {b.total}
                </span>
              </li>
            );
          })}
        </ul>
        {hardest && hardest.total > 0 && hardest.hits < hardest.total && (
          <p className="mt-3 text-sm text-slate-500">
            Hardest today: <b>{hardest.c}</b>
          </p>
        )}
      </div>

      <Scoreboard entries={scores} highlight={highlight} scoreSuffix={` / ${pairs.length}`} />

      <div className="flex gap-3 mt-6 flex-wrap">
        <Button size="lg" onClick={onRestart} variant="primary">Play again</Button>
        <Button size="lg" onClick={onHome} variant="secondary">Back to games</Button>
      </div>
    </GameShell>
  );
}
