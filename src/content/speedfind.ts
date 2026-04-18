export type SpeedFindKind = 'menu' | 'timetable' | 'email' | 'flyer' | 'card';

export type SpeedFindText = {
  id: string;
  kind: SpeedFindKind;
  title: string;
  body: string; // plain text with {{...}} marking the answer span
  question: string;
  questionJa?: string;
};

// 20 short real-world texts. Each has exactly one {{target}} span that answers
// the question. Students tap words/numbers in the body to "find" the answer.
export const TEXTS: SpeedFindText[] = [
  // ---------------- MENU (4) ----------------
  {
    id: 'sf-menu-01',
    kind: 'menu',
    title: 'Fuji Ramen — Menu',
    body:
      'Shoyu ramen   ¥850\nMiso ramen    ¥900\nTonkotsu ramen   {{¥980}}\nSpicy ramen   ¥950\nGyoza (6 pcs)   ¥400',
    question: 'How much is the tonkotsu ramen?',
    questionJa: 'とんこつラーメンはいくら？',
  },
  {
    id: 'sf-menu-02',
    kind: 'menu',
    title: 'Sunny Cafe — Drinks',
    body:
      'Hot coffee   ¥400\nIced coffee   {{¥450}}\nGreen tea   ¥300\nOrange juice   ¥500\nCola   ¥350',
    question: 'What is the price of iced coffee?',
    questionJa: 'アイスコーヒーの値段は？',
  },
  {
    id: 'sf-menu-03',
    kind: 'menu',
    title: 'Lunch Set of the Day',
    body:
      'Monday: chicken curry\nTuesday: pork cutlet\nWednesday: grilled fish\nThursday: pasta\n{{Friday}}: tempura',
    question: 'Which day has tempura?',
    questionJa: '天ぷらの日は？',
  },
  {
    id: 'sf-menu-04',
    kind: 'menu',
    title: 'Cafe Menu — Small Plates',
    body:
      'Toast   ¥250\n{{Rice ball}}   ¥200\nSalad   ¥380\nEgg sandwich   ¥420\nSoup   ¥300',
    question: 'What is the cheapest item?',
    questionJa: '一番安いのは？',
  },

  // ---------------- TIMETABLE (4) ----------------
  {
    id: 'sf-tt-01',
    kind: 'timetable',
    title: 'Last trains from Tokyo Station',
    body:
      'To Shibuya   11:30 p.m.\nTo Shinjuku   {{11:42 p.m.}}\nTo Ueno   11:50 p.m.\nTo Yokohama   12:05 a.m.',
    question: 'When does the last train to Shinjuku leave?',
    questionJa: '新宿行きの最終電車は？',
  },
  {
    id: 'sf-tt-02',
    kind: 'timetable',
    title: 'Gym Opening Hours',
    body:
      'Mon–Fri   6 a.m. – 11 p.m.\nSaturday   8 a.m. – 9 p.m.\nSunday   9 a.m. – {{7 p.m.}}\nHolidays   closed',
    question: 'When does the gym close on Sunday?',
    questionJa: '日曜日の閉館時間は？',
  },
  {
    id: 'sf-tt-03',
    kind: 'timetable',
    title: 'City Library',
    body:
      'Monday   9 – 8\nTuesday   9 – 8\n{{Wednesday}}   closed\nThursday   9 – 8\nFriday   9 – 8\nSaturday   10 – 6',
    question: 'Which day is the library closed?',
    questionJa: '図書館が閉まっている曜日は？',
  },
  {
    id: 'sf-tt-04',
    kind: 'timetable',
    title: 'Cinema — Screen 2',
    body:
      'Movie A   10:00\nMovie B   13:30\nMovie C   16:45\nMovie D   {{20:15}}\nMovie E   22:30',
    question: 'When does the evening movie (Movie D) start?',
    questionJa: '夜の映画の開始時間は？',
  },

  // ---------------- EMAIL (4) ----------------
  {
    id: 'sf-em-01',
    kind: 'email',
    title: 'Meeting invite',
    body:
      'Hi team,\nOur Monday meeting will be in {{Room 302}}. Please bring your reports.\nThanks,\nKen',
    question: 'Which room is the meeting in?',
    questionJa: '会議室はどこ？',
  },
  {
    id: 'sf-em-02',
    kind: 'email',
    title: 'Order confirmation',
    body:
      'Thank you for your order #A-1129.\nYour package will arrive on {{April 10th}}.\nTracking number: JP882901.',
    question: 'When will the package arrive?',
    questionJa: '荷物はいつ届く？',
  },
  {
    id: 'sf-em-03',
    kind: 'email',
    title: 'From Anna',
    body:
      'Hi! Let\u2019s meet at Shibuya station on Saturday at {{3 p.m.}} I found a nice cafe near the exit.\nSee you,\nAnna',
    question: 'What time are they meeting on Saturday?',
    questionJa: '土曜日は何時に会う？',
  },
  {
    id: 'sf-em-04',
    kind: 'email',
    title: 'From your manager',
    body:
      'Please send me the sales report.\nThe deadline is {{Friday}} this week.\nThanks,\nMr. Sato',
    question: 'When is the deadline?',
    questionJa: '締切はいつ？',
  },

  // ---------------- FLYER (4) ----------------
  {
    id: 'sf-fl-01',
    kind: 'flyer',
    title: 'Summer Festival!',
    body:
      'Asakusa Park\nSaturday, July 20\nStart: {{5 p.m.}}\nFireworks at 8 p.m.\nFree entry',
    question: 'What time does the festival start?',
    questionJa: 'お祭りは何時から？',
  },
  {
    id: 'sf-fl-02',
    kind: 'flyer',
    title: 'Cooking Class — Sushi at Home',
    body:
      'Date: Sunday, June 8\nTime: 1 p.m. – 4 p.m.\nPrice: {{\u00a53,500}}\nBring: an apron\nSign up at the front desk.',
    question: 'How much is the cooking class?',
    questionJa: '料理教室の値段は？',
  },
  {
    id: 'sf-fl-03',
    kind: 'flyer',
    title: 'Apartment for Rent — Nakano',
    body:
      'Rent: \u00a5120,000 / month\nRooms: {{2LDK}}\nFloor: 3rd\nNear Nakano station (5 min walk)\nCall 03-1111-2222',
    question: 'How many rooms does it have?',
    questionJa: '部屋の数は？',
  },
  {
    id: 'sf-fl-04',
    kind: 'flyer',
    title: 'Fit Plus Gym — New Members',
    body:
      'Join this month!\nFree trial: {{7 days}}\nMonthly fee: \u00a59,000\nOpen 24 hours\nShowers included',
    question: 'How long is the free trial?',
    questionJa: '無料体験は何日間？',
  },

  // ---------------- CARD (4) ----------------
  {
    id: 'sf-cd-01',
    kind: 'card',
    title: 'Business card',
    body:
      'Hiroshi Tanaka\nSales Manager\nSakura Foods Ltd.\nTel: {{03-1234-5678}}\nhiroshi@sakura.co.jp',
    question: 'What is his phone number?',
    questionJa: '電話番号は？',
  },
  {
    id: 'sf-cd-02',
    kind: 'card',
    title: 'Birthday card',
    body:
      'Happy Birthday, Yuki!\nI hope you have a wonderful day.\nWith love,\n{{Mom}}',
    question: 'Who is the card from?',
    questionJa: 'カードの差出人は？',
  },
  {
    id: 'sf-cd-03',
    kind: 'card',
    title: 'Postcard from Kyoto',
    body:
      'Dear Mika,\nKyoto is beautiful, but the weather is {{rainy}} this week.\nSee you soon!\nTaro',
    question: 'How is the weather in Kyoto?',
    questionJa: '京都の天気は？',
  },
  {
    id: 'sf-cd-04',
    kind: 'card',
    title: 'Thank-you note',
    body:
      'Dear Mr. Smith,\nThank you very much for {{the book}}. I will read it this weekend.\nBest wishes,\nNao',
    question: 'What did Mr. Smith give?',
    questionJa: 'スミスさんは何をくれた？',
  },
];

// ----- Token parser -----
export type Token =
  | { kind: 'word'; index: number; text: string; isTarget: boolean }
  | { kind: 'space'; text: string }
  | { kind: 'newline' };

export type Parsed = {
  tokens: Token[];
  tapTargets: number[]; // indexes (into tokens where kind==='word') that are part of the answer
};

export function parseBody(body: string): Parsed {
  const tokens: Token[] = [];
  const tapTargets: number[] = [];
  let wordIdx = 0;

  const re = /\{\{([^}]+)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const before = body.slice(last, m.index);
    pushPlain(before);
    // target span: one button, even if multiple words (so taps are forgiving)
    tokens.push({ kind: 'word', index: wordIdx, text: m[1], isTarget: true });
    tapTargets.push(wordIdx);
    wordIdx += 1;
    last = m.index + m[0].length;
  }
  if (last < body.length) pushPlain(body.slice(last));

  function pushPlain(plain: string) {
    // split preserving whitespace and newlines
    const parts = plain.split(/(\s+)/);
    for (const p of parts) {
      if (!p) continue;
      if (p === '\n') {
        tokens.push({ kind: 'newline' });
      } else if (/^\s+$/.test(p)) {
        // might contain newlines mixed with spaces — emit newlines individually
        for (const ch of p) {
          if (ch === '\n') tokens.push({ kind: 'newline' });
          else tokens.push({ kind: 'space', text: ch });
        }
      } else {
        tokens.push({ kind: 'word', index: wordIdx, text: p, isTarget: false });
        wordIdx += 1;
      }
    }
  }

  return { tokens, tapTargets };
}
