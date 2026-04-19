/**
 * Remote (shared) scoreboard client.
 * =====================================
 * Talks to the Google Apps Script Web App backed by one Google Sheet.
 * The local scoreboard (in `./scoreboard.ts`) is still the source of truth
 * for the UI — we show it instantly on game end (optimistic). This module
 * syncs in the background so everyone eventually sees the same top-10.
 *
 * If SCOREBOARD_URL is empty (first run, before you deploy the Apps Script),
 * every call falls back silently to local-only behavior.
 *
 * Deploy steps:
 *   1. Paste `scoreboard-backend/Code.gs` into script.google.com.
 *   2. Deploy → Web app → Execute as: Me → Who has access: Anyone.
 *   3. Copy the Web app URL, paste it below as SCOREBOARD_URL, commit.
 */

import type { ScoreEntry } from './scoreboard';

// ⇩ PASTE YOUR APPS SCRIPT WEB APP URL HERE ⇩
// Format: https://script.google.com/macros/s/XXXXXXXXX/exec
// Leave empty string to stay local-only.
export const SCOREBOARD_URL = '';

/** Local storage key → the allowlisted remote game key on the backend.
 *  Keep in sync with GAMES in `scoreboard-backend/Code.gs`. */
const REMOTE_KEY: Record<string, string> = {
  'mashup:scoreboard':       'mashup',
  'checkout:scoreboard':     'checkout',
  'fixtext:scoreboard':      'fixtext',
  'calendar:scoreboard':     'calendar',
  'speedfind:scoreboard':    'speedfind',
  'davesday:scoreboard':     'davesday',
  'grammarquest:scoreboard': 'grammarquest',
};

// 5-second network timeout: we never want a slow/dead backend to block the UI.
const TIMEOUT_MS = 5000;

function remoteKeyFor(scoresKey: string): string | null {
  return REMOTE_KEY[scoresKey] || null;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => { clearTimeout(id); resolve(v); },
      (e) => { clearTimeout(id); reject(e); },
    );
  });
}

function normalize(list: unknown): ScoreEntry[] {
  if (!Array.isArray(list)) return [];
  const out: ScoreEntry[] = [];
  for (const e of list) {
    if (!e || typeof e !== 'object') continue;
    const name = String((e as any).name ?? '').slice(0, 15);
    const score = Number((e as any).score);
    const ts = Number((e as any).ts) || 0;
    if (!name || !Number.isFinite(score)) continue;
    out.push({ name, score, ts });
  }
  return out;
}

/** GET the remote top-10 for one game. Returns `null` if remote is disabled
 *  or unreachable — callers should treat that as "just keep local". */
export async function fetchRemoteTop(scoresKey: string): Promise<ScoreEntry[] | null> {
  if (!SCOREBOARD_URL) return null;
  const remote = remoteKeyFor(scoresKey);
  if (!remote) return null;
  try {
    const url = `${SCOREBOARD_URL}?game=${encodeURIComponent(remote)}`;
    const res = await withTimeout(fetch(url, { method: 'GET' }), TIMEOUT_MS);
    if (!res.ok) return null;
    const body = await res.json();
    if (body && body.error) return null;
    return normalize(body?.scores);
  } catch {
    return null;
  }
}

/** POST a score. Returns the fresh remote top-10 (with our entry included) on
 *  success, or `null` if remote is disabled / unreachable. We send JSON as
 *  `text/plain` Content-Type so the browser skips the CORS preflight — Apps
 *  Script Web Apps don't respond to OPTIONS. */
export async function submitRemoteScore(
  scoresKey: string,
  entry: ScoreEntry,
): Promise<ScoreEntry[] | null> {
  if (!SCOREBOARD_URL) return null;
  const remote = remoteKeyFor(scoresKey);
  if (!remote) return null;
  try {
    const body = JSON.stringify({
      game: remote,
      name: entry.name,
      score: entry.score,
    });
    const res = await withTimeout(
      fetch(SCOREBOARD_URL, {
        method: 'POST',
        // text/plain dodges CORS preflight; Apps Script still parses body as JSON.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.error) return null;
    return normalize(data?.scores);
  } catch {
    return null;
  }
}

/** Convenience: returns true iff the remote is wired up. Lets games decide
 *  whether to show a "global" badge on the scoreboard. */
export function remoteEnabled(): boolean {
  return SCOREBOARD_URL.length > 0;
}
