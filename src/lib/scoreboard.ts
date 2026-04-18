import { loadJSON, saveJSON, removeKey } from './storage';

export type ScoreEntry = { name: string; score: number; ts: number };

const MAX_ENTRIES = 10;

export function loadScoreboard(key: string): ScoreEntry[] {
  const raw = loadJSON<ScoreEntry[]>(key, []);
  if (!Array.isArray(raw)) return [];
  // defensive: strip any bad entries
  return raw.filter((e): e is ScoreEntry => !!e && typeof e.name === 'string' && typeof e.score === 'number');
}

/** Append an entry and return the resulting trimmed, sorted list. Returns the
 * entry that was actually stored (same reference as `entry`) so callers can
 * compare identity for highlighting. Scores of 0 are ignored. */
export function addScore(key: string, entry: ScoreEntry): { list: ScoreEntry[]; added: boolean } {
  if (entry.score <= 0) {
    return { list: loadScoreboard(key), added: false };
  }
  const list = loadScoreboard(key);
  list.push(entry);
  list.sort((a, b) => (b.score - a.score) || (a.ts - b.ts));
  const trimmed = list.slice(0, MAX_ENTRIES);
  saveJSON(key, trimmed);
  const added = trimmed.some((e) => e.ts === entry.ts && e.name === entry.name && e.score === entry.score);
  return { list: trimmed, added };
}

export function topScore(key: string): number {
  return loadScoreboard(key)[0]?.score ?? 0;
}

/** One-time cleanup of legacy `<game>:best` keys (pre-scoreboard). Safe to call repeatedly. */
export function clearLegacyBestKeys() {
  ['mashup:best', 'mashup:bestBreakdown', 'checkout:best', 'fixtext:best', 'calendar:best', 'speedfind:best'].forEach(removeKey);
}
