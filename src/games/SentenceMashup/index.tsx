import { useEffect, useMemo, useState } from 'react';
import GameShell from '../../components/GameShell';
import Button from '../../components/Button';
import ScoreBar from '../../components/ScoreBar';
import HintText from '../../components/HintText';
import { useHints } from '../../lib/hint-context';
import { loadJSON, saveJSON, removeKey } from '../../lib/storage';
import { shuffle } from '../../lib/shuffle';
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
const BEST_KEY = 'mashup:best';
const BREAKDOWN_KEY = 'mashup:bestBreakdown';

type Answer = { id: string; picked: Conjunction; correctness: Correctness };

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
  const { hintsOn } = useHints();
  const [phase, setPhase] = useState<Phase>('intro');
  const [pairs, setPairs] = useState<MashupPair[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [pickedConj, setPickedConj] = useState<Conjunction | null>(null);
  const [best, setBest] = useState<number>(() => loadJSON<number>(BEST_KEY, 0));

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
    setPhase('playing');
  }

  function continueRound() {
    setPhase('playing');
  }

  function pickConjunction(conj: Conjunction) {
    if (pickedConj) return;
    setPickedConj(conj);
    const pair = pairs[idx];
    const correctness = correctnessFor(pair, conj);
    setAnswers((prev) => [...prev, { id: pair.id, picked: conj, correctness }]);
  }

  function next() {
    if (idx + 1 >= ROUND_SIZE) {
      // Finish round.
      const finalScore = computeScore(answers);
      if (finalScore > best) {
        setBest(finalScore);
        saveJSON(BEST_KEY, finalScore);
        saveJSON(BREAKDOWN_KEY, computeBreakdown(pairs, answers));
      }
      removeKey(RESUME_KEY);
      setPhase('results');
    } else {
      setIdx(idx + 1);
      setPickedConj(null);
    }
  }

  function resetToIntro() {
    removeKey(RESUME_KEY);
    setPairs([]);
    setIdx(0);
    setAnswers([]);
    setPickedConj(null);
    setPhase('intro');
  }

  // ---------------- render ----------------
  if (phase === 'intro') {
    return (
      <GameShell title="Sentence Mashup" titleJa="文つなぎ">
        <p className="text-lg text-slate-700">
          Join the two sentences with the best word: <b>and</b>, <b>but</b>, <b>because</b>, or <b>so</b>.
        </p>
        <HintText ja="二つの文を、and（そして）／but（しかし）／because（なぜなら）／so（だから）のどれかでつなげましょう。" />
        <p className="text-slate-600 mt-2">10 pairs per round.</p>
        {best > 0 && <p className="text-slate-600 mt-2">Your best: {best} / {ROUND_SIZE}</p>}
        <div className="mt-6">
          <Button size="lg" onClick={startNew} variant="primary">Start</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'resume') {
    return (
      <GameShell title="Sentence Mashup" titleJa="文つなぎ">
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
    return <Results pairs={pairs} answers={answers} onRestart={startNew} onHome={resetToIntro} hintsOn={hintsOn} />;
  }

  // playing
  const pair = pairs[idx];
  const correctness = pickedConj ? correctnessFor(pair, pickedConj) : null;
  const showCombined = pickedConj != null;
  return (
    <GameShell title="Sentence Mashup" titleJa="文つなぎ">
      <ScoreBar
        score={computeScore(answers)}
        progress={{ current: idx + (pickedConj ? 1 : 0), total: ROUND_SIZE }}
        best={best || undefined}
        className="mb-4"
      />

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

      {!pickedConj ? (
        <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-4">
          {CONJUNCTIONS.map((c) => (
            <Button key={c} size="lg" variant="secondary" onClick={() => pickConjunction(c)}>
              {c}
            </Button>
          ))}
        </div>
      ) : (
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
      <div className={`mt-5 rounded-2xl border p-4 ${color}`} role="status" aria-live="polite">
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
  onRestart,
  onHome,
  hintsOn,
}: {
  pairs: MashupPair[];
  answers: Answer[];
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
    <GameShell title="Sentence Mashup" titleJa="文つなぎ">
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

      <div className="flex gap-3 mt-6 flex-wrap">
        <Button size="lg" onClick={onRestart} variant="primary">Play again</Button>
        <Button size="lg" onClick={onHome} variant="secondary">Back to games</Button>
      </div>
    </GameShell>
  );
}
