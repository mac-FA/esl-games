# ESL Games

Five browser-based mini-games for adult Japanese learners (A1–A2 CEFR).
No logins, no backend, no API keys — runs fully client-side and works offline once loaded.

## Games

1. **Sentence Mashup** — conjunctions (and / but / because / so)
2. **Supermarket Checkout** — countable/uncountable + how much / how many
3. **Fix the Text** — capital letters and full stops
4. **Calendar Drop** — prepositions of time (in / on / at)
5. **Speed Find** — scanning & skimming real-world texts

## Local dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Adding content

Each game reads from its own typed data file in `src/content/`:

- `mashup.ts` — sentence pairs with the best conjunction
- `checkout.ts` — shopping items with countable/uncountable flag
- `fixtext.ts` — correctly-written paragraphs
- `calendar.ts` — time expressions with preposition
- `speedfind.ts` — realistic texts with question/answer spans

Edit the file, commit, push — new content goes live on next deploy.
