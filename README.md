# ESL Games

Five browser-based mini-games for adult Japanese learners (A1–A2 CEFR).
No logins, no backend, no API keys — runs fully client-side and works offline once loaded.

Live: https://mac-fa.github.io/esl-games/

## Games

| # | Game | Target language |
| - | ---- | --------------- |
| 1 | 🔗 **Sentence Mashup** | Conjunctions: *and / but / because / so* |
| 2 | 🛒 **Supermarket Checkout** | Countable vs. uncountable; *how much / how many* |
| 3 | ✏️ **Fix the Text** | Capital letters and full stops |
| 4 | 📅 **Calendar Drop** | Prepositions of time: *in / on / at* |
| 5 | 🔍 **Speed Find** | Scanning menus, timetables, emails, flyers, cards |

All games:

- Use **A1–A2 vocabulary** and Japan-contextual content (Tokyo, Osaka, Kyoto, konbini, trains, ramen, …).
- Have a **Japanese hint toggle** (top-right of every screen) that reveals a line of Japanese under every English prompt. The preference persists across sessions.
- Save your **best score** and resume any in-progress round via `localStorage` (no login, no server).
- Hit **48 px tap targets** with 18 px+ body text, designed tablet/phone-first.

## Local dev

```bash
npm install
npm run dev           # vite dev server at http://localhost:5173/esl-games/
npm run typecheck     # tsc --noEmit
npm run build         # tsc -b && vite build
npm run preview       # serve dist/
```

## Deploy

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`. The workflow also copies `index.html` → `404.html` so client-side routes work on refresh.

## Tech stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS v4 · React Router 6.

## Adding content

Every game reads from one typed data file in `src/content/`. Append an entry, commit, push — new content is live on the next deploy.

### `src/content/mashup.ts` (Sentence Mashup)

```ts
{
  id: 'm45',
  a: 'I woke up late.',
  b: 'I missed the train.',
  best: 'so',                // 'and' | 'but' | 'because' | 'so'
  acceptable: ['because'],   // other conjunctions that are also correct
  explain: { so: 'Cause → result: so.' }, // optional custom explanation
}
```

### `src/content/checkout.ts` (Supermarket Checkout)

```ts
{
  id: 'c31',
  emoji: '🥚',
  singular: 'egg',
  plural: 'eggs',
  countable: true,
  // note: 'Sold by weight' // required only for uncountable items
}
```

### `src/content/fixtext.ts` (Fix the Text)

```ts
{
  id: 'ft16',
  title: 'My neighbor',
  titleJa: '私の近所の人',
  correct: 'Mrs. Yamada lives next door. She is very kind.',
}
```

The `correct` string is the *target* paragraph with proper capitals and full stops. The game parses it and asks the student to restore them.

### `src/content/calendar.ts` (Calendar Drop)

```ts
{
  id: 'in23',
  text: 'February',
  prep: 'in',                 // 'in' | 'on' | 'at'
  note: 'Months → in',        // shown on wrong-answer feedback
}
```

### `src/content/speedfind.ts` (Speed Find)

```ts
{
  id: 'sf-menu-05',
  kind: 'menu',               // 'menu' | 'timetable' | 'email' | 'flyer' | 'card'
  title: 'Sakura Cafe — Cakes',
  body:
    'Cheesecake   ¥500\nChocolate cake   {{¥600}}\nFruit tart   ¥550',
  question: 'How much is the chocolate cake?',
  questionJa: 'チョコレートケーキはいくら？',
}
```

Mark the answer with `{{double braces}}`. Whitespace and newlines in `body` are preserved, so you can use them for menu/timetable layout.

## Project layout

```
src/
  components/        Button, Toast, GameShell, HintText, JapaneseHintToggle, ScoreBar
  content/           One data file per game (see above)
  games/             One folder per game (intro/playing/results state machine)
  lib/               storage, shuffle, hint-context
  App.tsx            Home grid + routes
  main.tsx           BrowserRouter + providers
  index.css          Tailwind import + touch CSS
```

## License

MIT
