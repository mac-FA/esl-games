import { Routes, Route, Link } from 'react-router-dom';

type GameMeta = {
  path: string;
  name: string;
  nameJa: string;
  topic: string;
  topicJa: string;
  minutes: string;
};

const GAMES: GameMeta[] = [
  {
    path: '/mashup',
    name: 'Sentence Mashup',
    nameJa: '文つなぎ',
    topic: 'Conjunctions: and / but / because / so',
    topicJa: '接続詞',
    minutes: '3–5 min',
  },
  {
    path: '/checkout',
    name: 'Supermarket Checkout',
    nameJa: 'スーパーのレジ',
    topic: 'Countable / Uncountable · How much / How many',
    topicJa: '数えられる・数えられない名詞',
    minutes: '4–5 min',
  },
  {
    path: '/fix-text',
    name: 'Fix the Text',
    nameJa: '文章を直そう',
    topic: 'Capital letters & full stops',
    topicJa: '大文字とピリオド',
    minutes: '3–4 min',
  },
  {
    path: '/calendar-drop',
    name: 'Calendar Drop',
    nameJa: 'カレンダー・ドロップ',
    topic: 'Prepositions of time: in / on / at',
    topicJa: '時を表す前置詞',
    minutes: '2–3 min',
  },
  {
    path: '/speed-find',
    name: 'Speed Find',
    nameJa: 'スピード・サーチ',
    topic: 'Scanning & skimming real-world texts',
    topicJa: 'スキャニング練習',
    minutes: '4–5 min',
  },
];

function Home() {
  return (
    <main className="min-h-full p-4 sm:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">English Practice Games</h1>
        <p className="text-slate-600 mt-1 text-lg">Level A1–A2 · 英語練習ゲーム</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <Link
            key={g.path}
            to={g.path}
            className="block p-5 rounded-2xl bg-white shadow-sm border border-slate-200 active:scale-[0.98] transition"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold">{g.name}</h2>
              <span className="text-sm text-slate-500">{g.nameJa}</span>
            </div>
            <p className="text-slate-700 mt-2">{g.topic}</p>
            <p className="text-sm text-slate-500 mt-1">{g.minutes}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <main className="min-h-full p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-blue-600 underline">← Home</Link>
      <h1 className="text-2xl font-bold mt-4">{title}</h1>
      <p className="text-slate-600 mt-2">Coming soon.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mashup" element={<Placeholder title="Sentence Mashup" />} />
      <Route path="/checkout" element={<Placeholder title="Supermarket Checkout" />} />
      <Route path="/fix-text" element={<Placeholder title="Fix the Text" />} />
      <Route path="/calendar-drop" element={<Placeholder title="Calendar Drop" />} />
      <Route path="/speed-find" element={<Placeholder title="Speed Find" />} />
      <Route path="*" element={<Placeholder title="Not found" />} />
    </Routes>
  );
}
