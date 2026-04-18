export type FixTextEntry = {
  id: string;
  title: string;
  titleJa?: string;
  correct: string;
};

export const TEXTS: FixTextEntry[] = [
  {
    id: 'ft01',
    title: 'My morning routine',
    titleJa: '朝の習慣',
    correct:
      'On Monday, I woke up at seven. I had coffee and toast. I walked to the station. The train was crowded, but I got to work on time.',
  },
  {
    id: 'ft02',
    title: 'A trip to Kyoto',
    titleJa: '京都への旅行',
    correct:
      'Last weekend, I visited Kyoto with my family. We stayed at a small hotel near the station. On Saturday, we went to Kinkaku-ji temple. The gold walls were beautiful.',
  },
  {
    id: 'ft03',
    title: 'My favorite restaurant',
    titleJa: 'お気に入りのレストラン',
    correct:
      'My favorite restaurant is in Osaka. It is called Fuji Ramen. Mr. Tanaka is the owner. His soup is the best in Japan.',
  },
  {
    id: 'ft04',
    title: 'Sunday at home',
    titleJa: '日曜日の過ごし方',
    correct:
      'I usually stay home on Sunday. I clean my apartment in the morning. In the afternoon, I read a book or watch a movie. Sometimes my sister visits me.',
  },
  {
    id: 'ft05',
    title: 'Meeting a friend in Shibuya',
    titleJa: '渋谷で友達と',
    correct:
      'Yesterday, I met my friend in Shibuya. We had lunch at a new cafe. After that, we walked around the shops. I bought a small gift for my mother.',
  },
  {
    id: 'ft06',
    title: 'The train to work',
    titleJa: '通勤の電車',
    correct:
      'I take the train to work every day. My station is Shinjuku. The trip takes about thirty minutes. I usually read the news on my phone.',
  },
  {
    id: 'ft07',
    title: 'Summer in Japan',
    titleJa: '日本の夏',
    correct:
      'Summer in Japan is very hot. In Tokyo, the temperature is often over thirty degrees. Many people go to the beach or the mountains. I prefer to stay inside.',
  },
  {
    id: 'ft08',
    title: 'Learning English',
    titleJa: '英語の勉強',
    correct:
      'I started learning English two years ago. My teacher is from Canada. His name is Mr. Smith. He is kind and patient.',
  },
  {
    id: 'ft09',
    title: 'The convenience store',
    titleJa: 'コンビニ',
    correct:
      'I often go to the convenience store. It is open twenty-four hours. I usually buy coffee and a rice ball. The staff are always friendly.',
  },
  {
    id: 'ft10',
    title: 'A new job',
    titleJa: '新しい仕事',
    correct:
      'Next month, I will start a new job. The office is in Marunouchi. I will work with a small team. I am a little nervous, but also excited.',
  },
  {
    id: 'ft11',
    title: 'Autumn in Kyoto',
    titleJa: '京都の秋',
    correct:
      'My grandmother lives in Kyoto. I visited her last November. The trees were red and yellow. We took many photos in the garden.',
  },
  {
    id: 'ft12',
    title: 'Cherry blossoms',
    titleJa: '桜の季節',
    correct:
      'In spring, the cherry blossoms open in Tokyo. Many people have picnics in the parks. The trees are most beautiful at night. They are lit by soft lights.',
  },
  {
    id: 'ft13',
    title: 'Learning to cook',
    titleJa: '料理を習う',
    correct:
      'I am learning how to cook Japanese food. Last week, I made miso soup for the first time. It was not perfect, but my family liked it. Next time, I want to try tempura.',
  },
  {
    id: 'ft14',
    title: 'A trip to Hokkaido',
    titleJa: '北海道旅行',
    correct:
      'Last winter, I traveled to Hokkaido. The snow was very deep. I went skiing with my friends. In the evening, we ate hot ramen in Sapporo.',
  },
  {
    id: 'ft15',
    title: 'My office',
    titleJa: '私のオフィス',
    correct:
      'My office is in Shinjuku. The building is tall and new. My desk is near the window. I can see Mt. Fuji on clear days.',
  },
];

export type Token =
  | { kind: 'word'; index: number; text: string; hasCap: boolean }
  | { kind: 'gap'; index: number; hasPeriod: boolean };

export type Parsed = {
  tokens: Token[];
  wordCount: number;
  gapCount: number;
};

export function parseParagraph(correct: string): Parsed {
  const normalized = correct.trim().replace(/\s+/g, ' ');
  const raw = normalized.split(' ');
  const tokens: Token[] = [];
  let wi = 0;
  let gi = 0;
  raw.forEach((w) => {
    const hasPeriod = w.endsWith('.');
    const cleanWord = hasPeriod ? w.slice(0, -1) : w;
    const hasCap = /^[A-Z]/.test(cleanWord);
    tokens.push({ kind: 'word', index: wi, text: cleanWord, hasCap });
    wi += 1;
    tokens.push({ kind: 'gap', index: gi, hasPeriod });
    gi += 1;
  });
  return { tokens, wordCount: wi, gapCount: gi };
}

export function applyCase(word: string, capOn: boolean): string {
  if (!word) return word;
  return capOn
    ? word.charAt(0).toUpperCase() + word.slice(1)
    : word.charAt(0).toLowerCase() + word.slice(1);
}
