import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../components/GameShell';
import Button from '../../components/Button';
import HintText from '../../components/HintText';
import Scoreboard from '../../components/Scoreboard';
import { loadJSON, saveJSON, removeKey } from '../../lib/storage';
import { shuffle } from '../../lib/shuffle';
import { useUser } from '../../lib/user-context';
import { addScore, loadScoreboard, type ScoreEntry } from '../../lib/scoreboard';
import { fetchRemoteTop, submitRemoteScore } from '../../lib/remote-scoreboard';
import { TEXTS, parseParagraph, applyCase, type FixTextEntry } from '../../content/fixtext';
import { GAME_BG } from '../../lib/game-bg';
import { sfx } from '../../lib/sfx';

const RESUME_KEY = 'fixtext:state';
const SCORES_KEY = 'fixtext:scoreboard';
const PER_TEXT_MS = 45_000;

type Phase = 'intro' | 'resume' | 'playing' | 'checked';

type SavedState = {
  id: string;
  caps: boolean[];
  periods: boolean[];
};

function pickOrder(): FixTextEntry[] {
  return shuffle(TEXTS);
}

export default function FixTheText() {
  const navigate = useNavigate();
  const { name } = useUser();
  const [phase, setPhase] = useState<Phase>('intro');
  const [order, setOrder] = useState<FixTextEntry[]>([]);
  const [orderIdx, setOrderIdx] = useState(0);
  const [caps, setCaps] = useState<boolean[]>([]);
  const [periods, setPeriods] = useState<boolean[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScoreboard(SCORES_KEY));
  const [justAdded, setJustAdded] = useState<ScoreEntry | undefined>(undefined);

  const entry: FixTextEntry | undefined = order[orderIdx];
  const parsed = useMemo(() => (entry ? parseParagraph(entry.correct) : null), [entry]);

  useEffect(() => {
    let cancelled = false;
    fetchRemoteTop(SCORES_KEY).then((remote) => {
      if (!cancelled && remote) setScores(remote);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const saved = loadJSON<SavedState | null>(RESUME_KEY, null);
    if (saved) {
      const found = TEXTS.find((t) => t.id === saved.id);
      if (found) {
        setOrder([found, ...shuffle(TEXTS.filter((t) => t.id !== found.id))]);
        setOrderIdx(0);
        setCaps(saved.caps);
        setPeriods(saved.periods);
        setPhase('resume');
        return;
      }
    }
    setPhase('intro');
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || !entry) return;
    saveJSON(RESUME_KEY, { id: entry.id, caps, periods } satisfies SavedState);
  }, [phase, entry, caps, periods]);

  // Per-text 20s timer. On expiry, auto-check with whatever the learner has
  // tapped so far. We use a ref so the setTimeout callback sees the latest
  // `check` (which closes over the latest caps/periods), without resetting
  // the timer on every tap.
  const checkRef = useRef<() => void>(() => {});
  checkRef.current = () => check();

  useEffect(() => {
    if (phase !== 'playing' || !entry) return;
    const id = window.setTimeout(() => checkRef.current(), PER_TEXT_MS);
    return () => window.clearTimeout(id);
  }, [phase, entry]);

  function startNew() {
    const o = pickOrder();
    setOrder(o);
    setOrderIdx(0);
    const p = parseParagraph(o[0].correct);
    setCaps(new Array(p.wordCount).fill(false));
    setPeriods(new Array(p.gapCount).fill(false));
    setPhase('playing');
  }

  function continueRound() {
    setPhase('playing');
  }

  function toggleCap(i: number) {
    setCaps((c) => c.map((v, idx) => (idx === i ? !v : v)));
    sfx('tap');
  }

  function togglePeriod(i: number) {
    setPeriods((p) => p.map((v, idx) => (idx === i ? !v : v)));
    sfx('tap');
  }

  function check() {
    setPhase('checked');
    if (!parsed) return;
    const correctCaps = parsed.tokens.filter((t) => t.kind === 'word' && t.hasCap === caps[t.index]).length;
    const correctPeriods = parsed.tokens.filter((t) => t.kind === 'gap' && t.hasPeriod === periods[t.index]).length;
    const total = parsed.wordCount + parsed.gapCount;
    const pct = Math.round((100 * (correctCaps + correctPeriods)) / total);
    if (pct > 0 && name) {
      const entry: ScoreEntry = { name, score: pct, ts: Date.now() };
      const { list } = addScore(SCORES_KEY, entry);
      setScores(list);
      setJustAdded(entry);
      submitRemoteScore(SCORES_KEY, entry).then((remote) => {
        if (remote) setScores(remote);
      });
    }
    removeKey(RESUME_KEY);
    sfx(pct === 100 ? 'win' : pct >= 70 ? 'correct' : 'wrong');
  }

  function tryAgain() {
    if (!parsed) return;
    setCaps(new Array(parsed.wordCount).fill(false));
    setPeriods(new Array(parsed.gapCount).fill(false));
    setPhase('playing');
  }

  function nextText() {
    const nextIdx = orderIdx + 1 >= order.length ? 0 : orderIdx + 1;
    const nextEntry = order[nextIdx];
    const p = parseParagraph(nextEntry.correct);
    setOrderIdx(nextIdx);
    setCaps(new Array(p.wordCount).fill(false));
    setPeriods(new Array(p.gapCount).fill(false));
    setPhase('playing');
  }

  function goHome() {
    removeKey(RESUME_KEY);
    navigate('/');
  }

  // ---------------- render ----------------
  if (phase === 'intro') {
    return (
      <GameShell title="Fix the Text" titleJa="文章を直そう" bg={GAME_BG.fixtext}>
        <p className="text-lg text-slate-700">
          Tap a word to capitalize its first letter. Tap a dot between words to add a period.
        </p>
        <HintText ja="単語をタップして大文字にします。単語の間の点をタップしてピリオドを入れます。" />
        <p className="text-slate-600 mt-2">{TEXTS.length} short texts · <b>45 seconds</b> each.</p>
        <div className="mt-6">
          <Button size="lg" onClick={startNew} variant="primary">Start</Button>
        </div>
        <Scoreboard entries={scores} scoreSuffix="%" />
      </GameShell>
    );
  }

  if (phase === 'resume') {
    return (
      <GameShell title="Fix the Text" titleJa="文章を直そう" bg={GAME_BG.fixtext}>
        <p className="text-lg text-slate-700">You have a text in progress.</p>
        <HintText ja="途中の文章があります。続けますか？" />
        <div className="flex gap-3 mt-6 flex-wrap">
          <Button size="lg" onClick={continueRound} variant="primary">Continue</Button>
          <Button size="lg" onClick={() => { removeKey(RESUME_KEY); startNew(); }} variant="secondary">Start over</Button>
        </div>
      </GameShell>
    );
  }

  if (!entry || !parsed) return null;

  // Score snapshot (only shown in checked phase).
  const correctCaps = parsed.tokens.filter((t) => t.kind === 'word' && t.hasCap === caps[t.index]).length;
  const correctPeriods = parsed.tokens.filter((t) => t.kind === 'gap' && t.hasPeriod === periods[t.index]).length;
  const total = parsed.wordCount + parsed.gapCount;
  const pct = Math.round((100 * (correctCaps + correctPeriods)) / total);

  return (
    <GameShell title="Fix the Text" titleJa="文章を直そう" bg={GAME_BG.fixtext}>
      <div className="flex items-baseline justify-between">
        <p className="text-sm uppercase tracking-wider text-slate-500">{entry.title}</p>
        <p className="text-sm text-slate-400">{orderIdx + 1} / {order.length}</p>
      </div>
      {entry.titleJa && <HintText ja={entry.titleJa} />}

      <CountdownBar active={phase === 'playing'} resetKey={`${orderIdx}-${phase}`} durationMs={PER_TEXT_MS} />

      <Paragraph
        parsed={parsed}
        caps={caps}
        periods={periods}
        checked={phase === 'checked'}
        onToggleCap={toggleCap}
        onTogglePeriod={togglePeriod}
      />

      {phase === 'playing' ? (
        <div className="mt-6 flex justify-end">
          <Button size="lg" onClick={check} variant="primary">Check</Button>
        </div>
      ) : (
        <CheckedPanel
          pct={pct}
          correct={correctCaps + correctPeriods}
          total={total}
          correctText={entry.correct}
          scores={scores}
          highlight={justAdded}
          onTryAgain={tryAgain}
          onNext={nextText}
          onHome={goHome}
        />
      )}
    </GameShell>
  );
}

function Paragraph({
  parsed,
  caps,
  periods,
  checked,
  onToggleCap,
  onTogglePeriod,
}: {
  parsed: ReturnType<typeof parseParagraph>;
  caps: boolean[];
  periods: boolean[];
  checked: boolean;
  onToggleCap: (i: number) => void;
  onTogglePeriod: (i: number) => void;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm leading-loose text-xl">
      <div className="flex flex-wrap gap-y-3 items-baseline">
        {parsed.tokens.map((t, k) => {
          if (t.kind === 'word') {
            const isCap = caps[t.index];
            const shown = applyCase(t.text, isCap);
            const wrong = checked && isCap !== t.hasCap;
            const right = checked && isCap === t.hasCap && t.hasCap; // only highlight correct caps positively
            return (
              <button
                key={k}
                type="button"
                onClick={() => !checked && onToggleCap(t.index)}
                disabled={checked}
                className={`px-1.5 py-1 rounded-md transition
                  ${isCap ? 'bg-blue-50' : ''}
                  ${wrong ? 'bg-rose-100 ring-2 ring-rose-400' : ''}
                  ${right ? 'ring-2 ring-emerald-400' : ''}
                  ${!checked ? 'active:scale-[0.97]' : ''}`}
                aria-label={`Word: ${t.text}. ${isCap ? 'Capitalized.' : 'Lowercase.'} Tap to toggle.`}
              >
                {shown}
              </button>
            );
          }
          // gap
          const hasP = periods[t.index];
          const wrong = checked && hasP !== t.hasPeriod;
          return (
            <button
              key={k}
              type="button"
              onClick={() => !checked && onTogglePeriod(t.index)}
              disabled={checked}
              className={`mx-0.5 inline-flex items-center justify-center min-w-[28px] min-h-[40px] rounded-md
                ${hasP ? 'text-slate-900 font-semibold' : 'text-slate-300'}
                ${wrong ? 'bg-rose-100 ring-2 ring-rose-400' : ''}
                ${checked && !wrong && t.hasPeriod ? 'ring-2 ring-emerald-400' : ''}
                ${!checked ? 'active:scale-[0.9]' : ''}`}
              aria-label={hasP ? 'Period here. Tap to remove.' : 'Gap. Tap to add a period.'}
            >
              {hasP ? '.' : '·'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckedPanel({
  pct,
  correct,
  total,
  correctText,
  scores,
  highlight,
  onTryAgain,
  onNext,
  onHome,
}: {
  pct: number;
  correct: number;
  total: number;
  correctText: string;
  scores: ScoreEntry[];
  highlight?: ScoreEntry;
  onTryAgain: () => void;
  onNext: () => void;
  onHome: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const perfect = pct === 100;
  const color = perfect
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : 'bg-slate-50 border-slate-200 text-slate-900';
  return (
    <>
      <div ref={ref} className={`mt-5 rounded-2xl border p-4 ${color}`} role="status" aria-live="polite">
        <p className="font-semibold">{perfect ? 'Perfect!' : `${pct}% \u2014 keep going`}</p>
        <HintText ja={perfect ? '満点です！' : 'もう少しです！'} className="text-inherit" />
        <p className="mt-1 text-sm">
          {correct} / {total} correct
        </p>
        {!perfect && (
          <div className="mt-3">
            <p className="text-sm text-slate-600">Correct version:</p>
            <p className="mt-1 text-base leading-relaxed">{correctText}</p>
          </div>
        )}
      </div>
      <Scoreboard entries={scores} highlight={highlight} scoreSuffix="%" />
      <div className="mt-6 flex gap-3 flex-wrap">
        <Button size="lg" onClick={onTryAgain} variant="secondary">Try again</Button>
        <Button size="lg" onClick={onNext} variant="primary">Next text</Button>
        <Button size="lg" onClick={onHome} variant="ghost">Back to games</Button>
      </div>
    </>
  );
}

function CountdownBar({ active, resetKey, durationMs }: { active: boolean; resetKey: number | string; durationMs: number }) {
  return (
    <div className="mt-3 mb-1 h-1.5 bg-slate-100 rounded-full overflow-hidden" aria-hidden>
      <div
        key={resetKey}
        className={active ? 'h-full bg-blue-500' : 'h-full bg-slate-300'}
        style={
          active
            ? { animation: `fixtext-countdown ${durationMs}ms linear forwards` }
            : { width: '0%' }
        }
      />
      <style>{`@keyframes fixtext-countdown { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
}
