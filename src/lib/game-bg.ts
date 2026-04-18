// Background image URLs for each game. Files live in /public/bg and are
// served under the Vite BASE_URL (e.g. "/esl-games/bg/mashup.webp" on Pages).
const BASE = import.meta.env.BASE_URL; // ends with "/"

export type GameBgKey = 'mashup' | 'checkout' | 'fixtext' | 'calendar' | 'speedfind';

export const GAME_BG: Record<GameBgKey, string> = {
  mashup: `${BASE}bg/mashup.webp`,
  checkout: `${BASE}bg/checkout.webp`,
  fixtext: `${BASE}bg/fixtext.webp`,
  calendar: `${BASE}bg/calendar.webp`,
  speedfind: `${BASE}bg/speedfind.webp`,
};

export const ALL_GAME_BG_URLS: string[] = Object.values(GAME_BG);

/** Fire-and-forget preload so navigating to a game doesn't flash unstyled. */
export function preloadGameBackgrounds() {
  if (typeof document === 'undefined') return;
  ALL_GAME_BG_URLS.forEach((url) => {
    // <link rel="preload" as="image"> gets the browser fetching early.
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
    // Also kick off an Image() so decoding starts even if preload is ignored.
    const img = new Image();
    img.src = url;
  });
}
