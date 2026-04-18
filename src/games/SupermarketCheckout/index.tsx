import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../components/GameShell';
import Button from '../../components/Button';
import ScoreBar from '../../components/ScoreBar';
import HintText from '../../components/HintText';
import Scoreboard from '../../components/Scoreboard';
import { loadJSON, saveJSON, removeKey } from '../../lib/storage';
import { shuffle } from '../../lib/shuffle';
import { useUser } from '../../lib/user-context';
import { addScore, loadScoreboard, type ScoreEntry } from '../../lib/scoreboard';
import { ITEMS, ROUND_SIZE, type CheckoutItem } from '../../content/checkout';

const RESUME_KEY = 'checkout:state';
const SCORES_KEY = 'checkout:scoreboard';
const MAX_SCORE = ROUND_SIZE * 2;

type SortAnswer = { id: string; pickedCountable: boolean; correct: boolean };
type QuestionAnswer = { id: string; pickedMuch: boolean; correct: boolean };

type Phase = 'intro' | 'resume' | 'phase1' | 'phase1-feedback' | 'phase2' | 'phase2-feedback' | 'results';

type SavedState = {
  itemIds: string[];
  phase: Exclude<Phase, 'intro' | 'resume' | 'results' | 'phase1-feedback' | 'phase2-feedback'>;
  idx: number;
  sortAnswers: SortAnswer[];
  questionAnswers: QuestionAnswer[];
};

function pickRound(): CheckoutItem[] {
  const uncountable = ITEMS.filter((i) => !i.countable);
  const countable = ITEMS.filter((i) => i.countable);
  const half = Math.floor(ROUND_SIZE / 2);
  const mix = [...shuffle(uncountable).slice(0, half), ...shuffle(countable).slice(0, ROUND_SIZE - half)];
  return shuffle(mix);
}

function totalScore(s: SortAnswer[], q: QuestionAnswer[]): number {
  return s.filter((x) => x.correct).length + q.filter((x) => x.correct).length;
}

export default function SupermarketCheckout() {
  const navigate = useNavigate();
  const { name } = useUser();
  const [phase, setPhase] = useState<Phase>('intro');
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [sortAnswers, setSortAnswers] = useState<SortAnswer[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScoreboard(SCORES_KEY));
  const [justAdded, setJustAdded] = useState<ScoreEntry | undefined>(undefined);
  const [lastPick, setLastPick] = useState<{ kind: 'sort' | 'question'; correct: boolean; extra?: boolean } | null>(null);

  useEffect(() => {
    const saved = loadJSON<SavedState | null>(RESUME_KEY, null);
    if (saved && saved.itemIds?.length === ROUND_SIZE) {
      const restored = saved.itemIds.map((id) => ITEMS.find((i) => i.id === id)).filter(Boolean) as CheckoutItem[];
      if (restored.length === ROUND_SIZE) {
        setItems(restored);
        setIdx(saved.idx);
        setSortAnswers(saved.sortAnswers ?? []);
        setQuestionAnswers(saved.questionAnswers ?? []);
        setPhase('resume');
        return;
      }
    }
    setPhase('intro');
  }, []);

  useEffect(() => {
    if (phase !== 'phase1' && phase !== 'phase2') return;
    const state: SavedState = {
      itemIds: items.map((i) => i.id),
      phase,
      idx,
      sortAnswers,
      questionAnswers,
    };
    saveJSON(RESUME_KEY, state);
  }, [phase, items, idx, sortAnswers, questionAnswers]);

  function startNew() {
    const round = pickRound();
    setItems(round);
    setIdx(0);
    setSortAnswers([]);
    setQuestionAnswers([]);
    setLastPick(null);
    setPhase('phase1');
  }

  function pickBin(binCountable: boolean) {
    const item = items[idx];
    const correct = binCountable === item.countable;
    setSortAnswers((prev) => [...prev, { id: item.id, pickedCountable: binCountable, correct }]);
    setLastPick({ kind: 'sort', correct });
    setPhase('phase1-feedback');
  }

  function advancePhase1() {
    setLastPick(null);
    if (idx + 1 >= ROUND_SIZE) {
      setIdx(0);
      setPhase('phase2');
    } else {
      setIdx(idx + 1);
      setPhase('phase1');
    }
  }

  function pickQuestion(much: boolean) {
    const item = items[idx];
    const correct = much === !item.countable; // "how much" is correct for uncountable
    setQuestionAnswers((prev) => [...prev, { id: item.id, pickedMuch: much, correct }]);
    setLastPick({ kind: 'question', correct });
    setPhase('phase2-feedback');
  }

  function advancePhase2() {
    setLastPick(null);
    if (idx + 1 >= ROUND_SIZE) {
      const total = totalScore(sortAnswers, questionAnswers);
      if (total > 0 && name) {
        const entry: ScoreEntry = { name, score: total, ts: Date.now() };
        const { list } = addScore(SCORES_KEY, entry);
        setScores(list);
        setJustAdded(entry);
      }
      removeKey(RESUME_KEY);
      setPhase('results');
    } else {
      setIdx(idx + 1);
      setPhase('phase2');
    }
  }

  function goHome() {
    removeKey(RESUME_KEY);
    navigate('/');
  }

  // ---------------- render ----------------
  if (phase === 'intro') {
    return (
      <GameShell title="Supermarket Checkout" titleJa="スーパーのレジ">
        <p className="text-lg text-slate-700">
          Two phases: sort each item as <b>countable</b> or <b>uncountable</b>, then ask the shopkeeper with <b>How much</b> or <b>How many</b>.
        </p>
        <HintText ja="フェーズ1：数えられる／数えられない名詞を仕分けします。フェーズ2：How much / How many を選んで質問します。" />
        <div className="mt-6">
          <Button size="lg" onClick={startNew} variant="primary">Start</Button>
        </div>
        <Scoreboard entries={scores} scoreSuffix={` / ${MAX_SCORE}`} />
      </GameShell>
    );
  }

  if (phase === 'resume') {
    return (
      <GameShell title="Supermarket Checkout" titleJa="スーパーのレジ">
        <p className="text-lg text-slate-700">You have a round in progress.</p>
        <HintText ja="途中のゲームがあります。続けますか？" />
        <div className="flex gap-3 mt-6 flex-wrap">
          <Button size="lg" onClick={() => setPhase(idx < ROUND_SIZE && questionAnswers.length > 0 ? 'phase2' : 'phase1')} variant="primary">
            Continue
          </Button>
          <Button size="lg" onClick={() => { removeKey(RESUME_KEY); startNew(); }} variant="secondary">
            Start over
          </Button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'results') {
    const sortedHits = sortAnswers.filter((x) => x.correct).length;
    const questionHits = questionAnswers.filter((x) => x.correct).length;
    const total = sortedHits + questionHits;
    return (
      <GameShell title="Supermarket Checkout" titleJa="スーパーのレジ">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-sm">
          <p className="text-sm uppercase tracking-wider text-slate-500">Round complete</p>
          <p className="text-5xl font-bold mt-2">
            {total} / {ROUND_SIZE * 2}
          </p>
          <HintText ja="おつかれさまでした！" />
        </div>
        <div className="mt-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-2 text-slate-700">
          <div className="flex justify-between"><span>Phase 1 — Sorting</span><span>{sortedHits} / {ROUND_SIZE}</span></div>
          <div className="flex justify-between"><span>Phase 2 — Questions</span><span>{questionHits} / {ROUND_SIZE}</span></div>
        </div>
        <Scoreboard entries={scores} highlight={justAdded} scoreSuffix={` / ${MAX_SCORE}`} />
        <div className="flex gap-3 mt-6 flex-wrap">
          <Button size="lg" onClick={startNew} variant="primary">Play again</Button>
          <Button size="lg" onClick={goHome} variant="secondary">Back to games</Button>
        </div>
      </GameShell>
    );
  }

  // In phase1/2 or feedback
  const item = items[idx];
  const inPhase1 = phase === 'phase1' || phase === 'phase1-feedback';
  const currentScore = totalScore(sortAnswers, questionAnswers);
  const progressCurrent = inPhase1 ? idx + (phase === 'phase1-feedback' ? 1 : 0) : ROUND_SIZE + idx + (phase === 'phase2-feedback' ? 1 : 0);
  const progressTotal = ROUND_SIZE * 2;

  return (
    <GameShell title="Supermarket Checkout" titleJa="スーパーのレジ">
      <ScoreBar
        score={currentScore}
        progress={{ current: progressCurrent, total: progressTotal }}
        best={scores[0]?.score || undefined}
        className="mb-4"
      />
      <p className="text-sm uppercase tracking-wider text-slate-500">
        {inPhase1 ? `Phase 1 · Sort the items` : `Phase 2 · Ask the shopkeeper`}
      </p>
      <HintText ja={inPhase1 ? '数えられる／数えられないを選びましょう' : 'How much / How many を選びましょう'} />

      {inPhase1 ? <Phase1View item={item} phase={phase} lastPick={lastPick} onPick={pickBin} onNext={advancePhase1} /> : <Phase2View item={item} phase={phase} lastPick={lastPick} onPick={pickQuestion} onNext={advancePhase2} />}
    </GameShell>
  );
}

// ---------------- Phase 1 ----------------

function Phase1View({
  item,
  phase,
  lastPick,
  onPick,
  onNext,
}: {
  item: CheckoutItem;
  phase: Phase;
  lastPick: { kind: 'sort' | 'question'; correct: boolean } | null;
  onPick: (binCountable: boolean) => void;
  onNext: () => void;
}) {
  const feedback = phase === 'phase1-feedback';
  return (
    <div>
      {/* Conveyor belt + item */}
      <div className="mt-4 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300 p-8 relative overflow-hidden">
        <div
          key={item.id}
          className="flex flex-col items-center conveyor-slide"
        >
          <div className="text-7xl select-none" aria-hidden>{item.emoji}</div>
          <div className="mt-2 text-2xl font-semibold">{item.singular}</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-slate-400/40" />
        <style>{`
          @keyframes conveyor-slide-in {
            from { transform: translateX(40%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          .conveyor-slide { animation: conveyor-slide-in 350ms ease-out; }
        `}</style>
      </div>

      {/* Bins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          onClick={() => !feedback && onPick(true)}
          disabled={feedback}
          className="rounded-2xl border-2 border-slate-300 bg-white p-5 text-left active:scale-[0.98] transition disabled:opacity-60 min-h-[96px]"
        >
          <div className="text-sm uppercase tracking-wider text-slate-500">Countable</div>
          <div className="font-semibold text-lg mt-1">some / a few / many</div>
        </button>
        <button
          type="button"
          onClick={() => !feedback && onPick(false)}
          disabled={feedback}
          className="rounded-2xl border-2 border-slate-300 bg-white p-5 text-left active:scale-[0.98] transition disabled:opacity-60 min-h-[96px]"
        >
          <div className="text-sm uppercase tracking-wider text-slate-500">Uncountable</div>
          <div className="font-semibold text-lg mt-1">some / a little / much</div>
        </button>
      </div>

      {feedback && (
        <FeedbackBanner
          correct={lastPick?.correct ?? false}
          message={
            lastPick?.correct
              ? `Yes \u2014 "${item.singular}" is ${item.countable ? 'countable' : 'uncountable'}.`
              : `"${item.singular}" is ${item.countable ? 'countable' : 'uncountable'}.${item.note ? ' ' + item.note : ''}`
          }
          onNext={onNext}
        />
      )}
    </div>
  );
}

// ---------------- Phase 2 ----------------

function Phase2View({
  item,
  phase,
  lastPick,
  onPick,
  onNext,
}: {
  item: CheckoutItem;
  phase: Phase;
  lastPick: { kind: 'sort' | 'question'; correct: boolean } | null;
  onPick: (much: boolean) => void;
  onNext: () => void;
}) {
  const feedback = phase === 'phase2-feedback';
  const rightMuch = !item.countable;

  return (
    <div>
      <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-5xl" aria-hidden>{item.emoji}</div>
          <div>
            <p className="text-slate-500 text-sm">Shopping list</p>
            <p className="text-xl font-semibold">You need {item.countable ? item.plural : item.singular}.</p>
            <HintText ja="店員さんに聞いてみましょう。" />
          </div>
        </div>
      </div>

      {!feedback ? (
        <div className="grid grid-cols-1 gap-3 mt-5">
          <button
            type="button"
            onClick={() => onPick(true)}
            className="rounded-2xl border-2 border-slate-300 bg-white p-4 text-left active:scale-[0.98] transition min-h-[64px]"
          >
            <span className="font-semibold text-lg">
              How much <span className="text-slate-500">{item.singular}</span> do you need?
            </span>
          </button>
          <button
            type="button"
            onClick={() => onPick(false)}
            className="rounded-2xl border-2 border-slate-300 bg-white p-4 text-left active:scale-[0.98] transition min-h-[64px]"
          >
            <span className="font-semibold text-lg">
              How many <span className="text-slate-500">{item.plural}</span> do you need?
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-slate-700">Correct question:</p>
          <p className="mt-1 text-xl font-semibold">
            How {rightMuch ? 'much' : 'many'} {rightMuch ? item.singular : item.plural} do you need?
          </p>
        </div>
      )}

      {feedback && (
        <FeedbackBanner
          correct={lastPick?.correct ?? false}
          message={
            lastPick?.correct
              ? `Yes \u2014 "${item.singular}" is ${item.countable ? 'countable' : 'uncountable'}, so we use "${rightMuch ? 'how much' : 'how many'}."`
              : `"${item.singular}" is ${item.countable ? 'countable' : 'uncountable'}.${item.note ? ' ' + item.note : ''}`
          }
          onNext={onNext}
        />
      )}
    </div>
  );
}

// ---------------- Shared feedback ----------------

function FeedbackBanner({
  correct,
  message,
  onNext,
}: {
  correct: boolean;
  message: string;
  onNext: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  const color = correct
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : 'bg-rose-50 border-rose-200 text-rose-900';
  const label = correct ? 'Correct ✓' : 'Not quite';
  const labelJa = correct ? '正解です' : '違います';
  return (
    <>
      <div ref={ref} className={`mt-5 rounded-2xl border p-4 ${color}`} role="status" aria-live="polite">
        <p className="font-semibold">{label}</p>
        <HintText ja={labelJa} className="text-inherit" />
        <p className="mt-2 text-base">{message}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onNext} variant="primary">Next</Button>
      </div>
    </>
  );
}
