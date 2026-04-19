import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import JapaneseHintToggle from '../components/JapaneseHintToggle';
import HintText from '../components/HintText';
import Scoreboard from '../components/Scoreboard';
import { useUser } from '../lib/user-context';
import { addScore, loadScoreboard, type ScoreEntry } from '../lib/scoreboard';

/**
 * Hosts one of the legacy single-file HTML games (Dave's Day, Grammar Quest)
 * inside an iframe. A tiny postMessage bridge in each HTML file:
 *   - announces "ready" when loaded,
 *   - accepts the player's display name from us,
 *   - posts the final score back when the game ends.
 *
 * Score is submitted to the same `<game>:scoreboard` localStorage key the
 * React games use, so the leaderboard UI is identical.
 */

type Props = {
  /** The filename inside /public/legacy/ (e.g. 'daves-day.html'). */
  file: string;
  /** Message id this game reports under, e.g. 'daves-day'. */
  gameId: 'daves-day' | 'grammar-quest';
  /** Scoreboard storage key. */
  scoresKey: string;
  title: string;
  titleJa: string;
  /** Max possible score (e.g. 18 for Dave's, 12 for Grammar Quest). */
  maxScore: number;
};

export default function LegacyFrame({ file, gameId, scoresKey, title, titleJa, maxScore }: Props) {
  const { name } = useUser();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScoreboard(scoresKey));
  const [justAdded, setJustAdded] = useState<ScoreEntry | undefined>(undefined);
  const submittedRef = useRef<Set<string>>(new Set());

  // Build iframe src with BASE_URL so GitHub Pages serves it correctly.
  const src = `${import.meta.env.BASE_URL}legacy/${file}`;

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const data = ev.data;
      if (!data || typeof data !== 'object') return;
      // Only listen to messages from our own iframe.
      if (frameRef.current && ev.source !== frameRef.current.contentWindow) return;

      if (data.type === 'esl:ready' && data.game === gameId) {
        // Send the player's name back to the iframe.
        try {
          frameRef.current?.contentWindow?.postMessage(
            { type: 'esl:player-name', name: name ?? '' },
            '*',
          );
        } catch {
          // ignore
        }
      }

      if (data.type === 'esl:score' && data.game === gameId) {
        const score = Number(data.score);
        if (!Number.isFinite(score) || score <= 0) return;
        if (!name) return;
        // Dedupe: the iframe may re-render the gameover screen if the user
        // clicks "play again" → gameover; use ts + score as a fingerprint.
        const ts = Date.now();
        const key = `${ts}-${score}`;
        if (submittedRef.current.has(key)) return;
        submittedRef.current.add(key);
        const entry: ScoreEntry = { name, score, ts };
        const { list } = addScore(scoresKey, entry);
        setScores(list);
        setJustAdded(entry);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [gameId, scoresKey, name]);

  return (
    <main className="min-h-full p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          to="/"
          className="text-blue-600 font-medium min-h-[40px] inline-flex items-center"
          aria-label="Back to home"
        >
          ← Home
        </Link>
        <JapaneseHintToggle />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold">
        {title}
        <span className="ml-3 text-base text-slate-500 font-normal">{titleJa}</span>
      </h1>
      <HintText ja="ゲーム終了後、スコアがハイスコアに追加されます。" />

      <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          className="block w-full"
          style={{ height: 'min(780px, 85vh)', border: 0 }}
          // These games are self-contained single-file HTML we control.
          // Allow same-origin so postMessage + audio work reliably.
          sandbox="allow-scripts allow-same-origin"
          allow="autoplay"
        />
      </div>

      <Scoreboard
        entries={scores}
        highlight={justAdded}
        scoreSuffix={` / ${maxScore}`}
      />
    </main>
  );
}
