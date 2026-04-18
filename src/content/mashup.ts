export type Conjunction = 'and' | 'but' | 'because' | 'so';

export const CONJUNCTIONS: Conjunction[] = ['and', 'but', 'because', 'so'];

export type Correctness = 'best' | 'acceptable' | 'wrong';

export type MashupPair = {
  id: string;
  a: string;
  b: string;
  best: Conjunction;
  acceptable?: Conjunction[];
  // Optional per-pair override; otherwise falls back to defaults by pair's `best`.
  explain?: Partial<Record<Conjunction, string>>;
};

export const PAIRS: MashupPair[] = [
  // ---- AND (addition / sequence) ----
  { id: 'a1', a: 'I woke up at seven.', b: 'I took a shower.', best: 'and', acceptable: ['so'] },
  { id: 'a2', a: 'My sister lives in Kyoto.', b: 'My brother lives in Hokkaido.', best: 'and' },
  { id: 'a3', a: 'I like coffee.', b: 'I drink it every morning.', best: 'and' },
  { id: 'a4', a: 'The store opens at ten.', b: 'It closes at eight.', best: 'and' },
  { id: 'a5', a: 'I bought bread.', b: 'I bought milk.', best: 'and' },
  { id: 'a6', a: 'He works in Shibuya.', b: 'She works in Shinjuku.', best: 'and' },
  { id: 'a7', a: 'We went to the park.', b: 'We had a picnic.', best: 'and', acceptable: ['so'] },
  { id: 'a8', a: 'It was sunny.', b: 'It was warm.', best: 'and' },
  { id: 'a9', a: 'I called my friend.', b: 'We made plans for Saturday.', best: 'and' },
  { id: 'a10', a: 'The ramen was hot.', b: 'The gyoza was fresh.', best: 'and' },
  { id: 'a11', a: 'I finished my work.', b: 'I went home.', best: 'and', acceptable: ['so'] },

  // ---- BUT (contrast / surprise) ----
  { id: 'b1', a: 'It was cold outside.', b: 'I didn\u2019t wear a jacket.', best: 'but' },
  { id: 'b2', a: 'I studied hard.', b: 'I failed the test.', best: 'but' },
  { id: 'b3', a: 'The restaurant was cheap.', b: 'The food was delicious.', best: 'but' },
  {
    id: 'b4',
    a: 'I wanted to go out.',
    b: 'I was too tired.',
    best: 'but',
    acceptable: ['so'],
    explain: {
      so: '\u201CSo\u201D can also work, but the meaning changes: \u201CI was too tired, so I didn\u2019t go out.\u201D For these two sentences in this order, \u201Cbut\u201D is more natural.',
    },
  },
  { id: 'b5', a: 'My apartment is small.', b: 'It\u2019s very comfortable.', best: 'but' },
  { id: 'b6', a: 'I like ramen.', b: 'I don\u2019t eat it often.', best: 'but' },
  { id: 'b7', a: 'The train was late.', b: 'I arrived on time.', best: 'but' },
  { id: 'b8', a: 'She speaks English well.', b: 'She never studied abroad.', best: 'but' },
  { id: 'b9', a: 'I have a lot of work.', b: 'I want to take a break.', best: 'but' },
  { id: 'b10', a: 'The coffee is hot.', b: 'I\u2019m still sleepy.', best: 'but' },
  { id: 'b11', a: 'Osaka is famous for food.', b: 'Many people visit Kyoto first.', best: 'but' },

  // ---- BECAUSE (reason) ----
  { id: 'c1', a: 'I took an umbrella.', b: 'It was raining.', best: 'because' },
  { id: 'c2', a: 'I was late for work.', b: 'The train stopped.', best: 'because' },
  { id: 'c3', a: 'She went home early.', b: 'She had a headache.', best: 'because' },
  { id: 'c4', a: 'We didn\u2019t go to the beach.', b: 'The weather was bad.', best: 'because' },
  { id: 'c5', a: 'I started learning Japanese.', b: 'I wanted to travel in Japan.', best: 'because' },
  { id: 'c6', a: 'He is happy today.', b: 'He got a new job.', best: 'because' },
  { id: 'c7', a: 'The shop was closed.', b: 'It was already ten o\u2019clock.', best: 'because' },
  { id: 'c8', a: 'I love this cafe.', b: 'The coffee is really good.', best: 'because' },
  { id: 'c9', a: 'I stayed inside all day.', b: 'It was too hot.', best: 'because' },
  { id: 'c10', a: 'They moved to Osaka.', b: 'They found new jobs there.', best: 'because' },
  { id: 'c11', a: 'I don\u2019t drink coffee at night.', b: 'I can\u2019t sleep after.', best: 'because' },

  // ---- SO (result / therefore) ----
  { id: 's1', a: 'It was raining.', b: 'I took an umbrella.', best: 'so', acceptable: ['and'] },
  { id: 's2', a: 'I was hungry.', b: 'I stopped at a convenience store.', best: 'so' },
  { id: 's3', a: 'The shop was closed.', b: 'We went home.', best: 'so' },
  { id: 's4', a: 'My phone was dead.', b: 'I couldn\u2019t call her.', best: 'so' },
  { id: 's5', a: 'I missed the last train.', b: 'I took a taxi.', best: 'so' },
  { id: 's6', a: 'She was tired.', b: 'She went to bed early.', best: 'so', acceptable: ['and'] },
  { id: 's7', a: 'It was his birthday.', b: 'We bought a cake.', best: 'so' },
  { id: 's8', a: 'The meeting was cancelled.', b: 'I went home early.', best: 'so' },
  { id: 's9', a: 'The restaurant was full.', b: 'We ate somewhere else.', best: 'so' },
  { id: 's10', a: 'I didn\u2019t have any cash.', b: 'I used my card.', best: 'so' },
  { id: 's11', a: 'We had no milk.', b: 'I went to the konbini.', best: 'so' },
];

// Default explanations by (pair.best, picked). Used when a pair doesn't override.
const DEFAULTS: Record<Conjunction, Record<Conjunction, string>> = {
  and: {
    and: 'Yes \u2014 these two ideas just add together.',
    but: '\u201CBut\u201D shows contrast. Here the two ideas agree.',
    because: '\u201CBecause\u201D needs a reason. These ideas are just added together.',
    so: '\u201CSo\u201D needs a result. These ideas are just added together.',
  },
  but: {
    and: '\u201CAnd\u201D just adds. Here the second idea is surprising \u2014 use \u201Cbut.\u201D',
    but: 'Yes \u2014 \u201Cbut\u201D shows contrast or a surprising turn.',
    because: '\u201CBecause\u201D needs a reason, not a contrast.',
    so: '\u201CSo\u201D shows a result, not a contrast.',
  },
  because: {
    and: '\u201CAnd\u201D just adds. The second sentence gives a reason \u2014 use \u201Cbecause.\u201D',
    but: '\u201CBut\u201D shows contrast. The second sentence is the reason for the first.',
    because: 'Yes \u2014 the second sentence is the reason.',
    so: '\u201CSo\u201D shows a result. Here the reason comes second \u2014 use \u201Cbecause.\u201D',
  },
  so: {
    and: '\u201CAnd\u201D just adds. The second sentence is the result \u2014 try \u201Cso.\u201D',
    but: '\u201CBut\u201D shows contrast. Here the second idea is a result, not a contrast.',
    because: '\u201CBecause\u201D works if you swap the order. In this order, try \u201Cso.\u201D',
    so: 'Yes \u2014 the second sentence is the result.',
  },
};

export function explainFor(pair: MashupPair, picked: Conjunction): string {
  return pair.explain?.[picked] ?? DEFAULTS[pair.best][picked];
}

export function correctnessFor(pair: MashupPair, picked: Conjunction): Correctness {
  if (picked === pair.best) return 'best';
  if (pair.acceptable?.includes(picked)) return 'acceptable';
  return 'wrong';
}

// Comma rules (pedagogical simplification):
//   - `but`, `so`, `because` take a leading comma
//   - `and` does not
const COMMA_BEFORE: Record<Conjunction, boolean> = {
  and: false,
  but: true,
  because: true,
  so: true,
};

function decapitalizeFirst(s: string): string {
  if (/^I(\b|['\u2019])/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function combineClause(a: string, b: string, conj: Conjunction): string {
  const aTrim = a.replace(/\s*\.\s*$/, '');
  const bPrepared = decapitalizeFirst(b);
  const sep = COMMA_BEFORE[conj] ? ', ' : ' ';
  return `${aTrim}${sep}${conj} ${bPrepared}`;
}
