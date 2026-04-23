import type { CSSProperties, ReactNode } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import JapaneseHintToggle from './components/JapaneseHintToggle';
import HintText from './components/HintText';
import GameShell from './components/GameShell';
import PixelThumb from './components/PixelThumb';
import { useHints } from './lib/hint-context';
import { useUser } from './lib/user-context';
import { GAME_BG, type GameBgKey } from './lib/game-bg';
import SentenceMashup from './games/SentenceMashup';
import SupermarketCheckout from './games/SupermarketCheckout';
import FixTheText from './games/FixTheText';
import CalendarDrop from './games/CalendarDrop';
import SpeedFind from './games/SpeedFind';
import DavesDay from './games/DavesDay';
import GrammarQuest from './games/GrammarQuest';

type GameMeta = {
  path: string;
  icon: string;
  name: string;
  nameJa: string;
  /** Subtitle — may embed <em> to highlight key target language. */
  topic: ReactNode;
  topicJa: string;
  minutes: string;
  /** 16:9 art slot. Either a webp background key or a pixel sprite identifier. */
  thumb:
    | { kind: 'webp'; bgKey: GameBgKey }
    | { kind: 'pixel'; sprite: 'dave' | 'castle' };
};

const GAMES: GameMeta[] = [
  {
    path: '/mashup',
    icon: '🔗',
    name: 'Sentence Mashup',
    nameJa: '文つなぎ',
    topic: (
      <>
        Conjunctions: <em>and</em> / <em>but</em> / <em>because</em> / <em>so</em>
      </>
    ),
    topicJa: '接続詞の練習',
    minutes: '3–5 min',
    thumb: { kind: 'webp', bgKey: 'mashup' },
  },
  {
    path: '/checkout',
    icon: '🛒',
    name: 'Supermarket Checkout',
    nameJa: 'スーパーのレジ',
    topic: (
      <>
        Countable / Uncountable · <em>How much</em> / <em>How many</em>
      </>
    ),
    topicJa: '数えられる名詞と数えられない名詞',
    minutes: '4–5 min',
    thumb: { kind: 'webp', bgKey: 'checkout' },
  },
  {
    path: '/fix-text',
    icon: '✏️',
    name: 'Fix the Text',
    nameJa: '文章を直そう',
    topic: (
      <>
        <em>Capital</em> letters &amp; <em>full stops</em>
      </>
    ),
    topicJa: '大文字とピリオド',
    minutes: '3–4 min',
    thumb: { kind: 'webp', bgKey: 'fixtext' },
  },
  {
    path: '/calendar-drop',
    icon: '📅',
    name: 'Calendar Drop',
    nameJa: 'カレンダー・ドロップ',
    topic: (
      <>
        Prepositions of time: <em>in</em> / <em>on</em> / <em>at</em>
      </>
    ),
    topicJa: '時を表す前置詞',
    minutes: '2–3 min',
    thumb: { kind: 'webp', bgKey: 'calendar' },
  },
  {
    path: '/speed-find',
    icon: '🔍',
    name: 'Speed Find',
    nameJa: 'スピード・サーチ',
    topic: <>Scanning &amp; skimming real-world texts</>,
    topicJa: 'スキャニング練習',
    minutes: '4–5 min',
    thumb: { kind: 'webp', bgKey: 'speedfind' },
  },
  {
    path: '/daves-day',
    icon: '🧍',
    name: "Dave's Day",
    nameJa: 'デイブの一日',
    topic: <>Daily vocabulary · read &amp; collect (8-bit)</>,
    topicJa: '日常語彙・読んで集める',
    minutes: '5–10 min',
    thumb: { kind: 'pixel', sprite: 'dave' },
  },
  {
    path: '/grammar-quest',
    icon: '🏰',
    name: 'Grammar Quest',
    nameJa: 'グラマー・クエスト',
    topic: (
      <>
        Past tense with <em>did</em> / <em>didn{'\u2019'}t</em> / <em>couldn{'\u2019'}t</em>
      </>
    ),
    topicJa: '過去形（did / didn\u2019t / couldn\u2019t）',
    minutes: '5–10 min',
    thumb: { kind: 'pixel', sprite: 'castle' },
  },
];

/** Background-image style value for the home backdrop. Resolved at runtime so
 *  it works both in the GitHub Pages build (base `/esl-games/`) and locally
 *  (base `/`). Exposed through the `--home-bg-url` custom property so the
 *  media-query override in `index.css` can share the same URL. */
const HOME_BG_STYLE = {
  ['--home-bg-url' as string]: `url('${import.meta.env.BASE_URL}garden-bg.webp')`,
} as CSSProperties;

function Home() {
  const { hintsOn } = useHints();
  const { name, changeName } = useUser();
  return (
    <>
      <div className="home-backdrop" aria-hidden="true" style={HOME_BG_STYLE} />
      <main className="home-shell">
        <header className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="home-title text-[28px]">English Practice Games</h1>
            <p className="home-level mt-1">Level A1–A2</p>
            {hintsOn && (
              <p className="home-level" style={{ fontWeight: 400, letterSpacing: 0 }}>
                英語練習ゲーム・初級（A1〜A2）レベル
              </p>
            )}
            {name && (
              <p className="home-greet mt-2">
                Playing as <b>{name}</b>{' '}
                <button type="button" onClick={changeName}>
                  (change)
                </button>
              </p>
            )}
          </div>
          <JapaneseHintToggle variant="pill" />
        </header>

        <p className="home-intro">
          Pick a game, practice out loud, beat your best time.
        </p>

        <div className="flex flex-col gap-4">
          {GAMES.map((g) => (
            <Link key={g.path} to={g.path} className="home-card">
              <div className="flex items-start justify-between gap-2">
                <h2 className="home-card-title">
                  <span className="emoji" aria-hidden="true">
                    {g.icon}
                  </span>
                  {g.name}
                </h2>
                <span className="home-card-ja">{g.nameJa}</span>
              </div>
              <p className="home-card-sub">{g.topic}</p>
              {hintsOn && (
                <p className="home-card-sub" style={{ fontStyle: 'italic', marginTop: 0 }}>
                  {g.topicJa}
                </p>
              )}
              <p className="home-card-meta">
                <span className="dot" aria-hidden="true" />
                {g.minutes}
              </p>

              <div className="home-card-art" aria-hidden="true">
                {g.thumb.kind === 'webp' ? (
                  <div
                    style={{
                      backgroundImage: `url('${GAME_BG[g.thumb.bgKey]}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      background: '#1b2220',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <PixelThumb which={g.thumb.sprite} size={96} />
                  </div>
                )}
              </div>

              <span className="home-card-play">Play →</span>
            </Link>
          ))}
        </div>

        <p className="home-footer">A little garden of English · 英語の小さな庭</p>
      </main>
    </>
  );
}

function Placeholder({ title, titleJa }: { title: string; titleJa?: string }) {
  return (
    <GameShell title={title} titleJa={titleJa}>
      <p className="text-slate-600 mt-2">Coming soon.</p>
      <HintText ja="準備中です。" />
    </GameShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mashup" element={<SentenceMashup />} />
      <Route path="/checkout" element={<SupermarketCheckout />} />
      <Route path="/fix-text" element={<FixTheText />} />
      <Route path="/calendar-drop" element={<CalendarDrop />} />
      <Route path="/speed-find" element={<SpeedFind />} />
      <Route path="/daves-day" element={<DavesDay />} />
      <Route path="/grammar-quest" element={<GrammarQuest />} />
      <Route path="*" element={<Placeholder title="Not found" titleJa="見つかりません" />} />
    </Routes>
  );
}
