import { Routes, Route, Link } from 'react-router-dom';
import JapaneseHintToggle from './components/JapaneseHintToggle';
import HintText from './components/HintText';
import GameShell from './components/GameShell';
import { useHints } from './lib/hint-context';
import SentenceMashup from './games/SentenceMashup';
import SupermarketCheckout from './games/SupermarketCheckout';
import FixTheText from './games/FixTheText';
import CalendarDrop from './games/CalendarDrop';
import SpeedFind from './games/SpeedFind';

type GameMeta = {
  path: string;
  icon: string;
  name: string;
  nameJa: string;
  topic: string;
  topicJa: string;
  minutes: string;
};

const GAMES: GameMeta[] = [
  {
    path: '/mashup',
    icon: '🔗',
    name: 'Sentence Mashup',
    nameJa: '文つなぎ',
    topic: 'Conjunctions: and / but / because / so',
    topicJa: '接続詞の練習',
    minutes: '3–5 min',
  },
  {
    path: '/checkout',
    icon: '🛒',
    name: 'Supermarket Checkout',
    nameJa: 'スーパーのレジ',
    topic: 'Countable / Uncountable · How much / How many',
    topicJa: '数えられる名詞と数えられない名詞',
    minutes: '4–5 min',
  },
  {
    path: '/fix-text',
    icon: '✏️',
    name: 'Fix the Text',
    nameJa: '文章を直そう',
    topic: 'Capital letters & full stops',
    topicJa: '大文字とピリオド',
    minutes: '3–4 min',
  },
  {
    path: '/calendar-drop',
    icon: '📅',
    name: 'Calendar Drop',
    nameJa: 'カレンダー・ドロップ',
    topic: 'Prepositions of time: in / on / at',
    topicJa: '時を表す前置詞',
    minutes: '2–3 min',
  },
  {
    path: '/speed-find',
    icon: '🔍',
    name: 'Speed Find',
    nameJa: 'スピード・サーチ',
    topic: 'Scanning & skimming real-world texts',
    topicJa: 'スキャニング練習',
    minutes: '4–5 min',
  },
];

function Home() {
  const { hintsOn } = useHints();
  return (
    <main className="min-h-full p-4 sm:p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">English Practice Games</h1>
          <p className="text-slate-600 mt-1 text-lg">Level A1–A2</p>
          <HintText ja="英語練習ゲーム・初級（A1〜A2）レベル" />
        </div>
        <JapaneseHintToggle />
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <Link
            key={g.path}
            to={g.path}
            className="block p-5 rounded-2xl bg-white shadow-sm border border-slate-200 active:scale-[0.98] transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold">
                <span aria-hidden="true" className="mr-2">{g.icon}</span>
                {g.name}
              </h2>
              <span className="text-sm text-slate-500">{g.nameJa}</span>
            </div>
            <p className="text-slate-700 mt-2">{g.topic}</p>
            {hintsOn && <p className="text-slate-500 text-sm mt-1">{g.topicJa}</p>}
            <p className="text-sm text-slate-500 mt-1">{g.minutes}</p>
          </Link>
        ))}
      </div>
    </main>
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
      <Route path="*" element={<Placeholder title="Not found" titleJa="見つかりません" />} />
    </Routes>
  );
}
