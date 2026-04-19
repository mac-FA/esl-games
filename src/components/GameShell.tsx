import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import JapaneseHintToggle from './JapaneseHintToggle';

type Props = {
  title: string;
  titleJa?: string;
  /** Optional background image URL. When set, the page renders with the
   *  image fixed behind a centered frosted-glass card. */
  bg?: string;
  /** If the background image is visually dark, switch the card to a dark tint. */
  bgDark?: boolean;
  children: ReactNode;
};

export default function GameShell({ title, titleJa, bg, bgDark, children }: Props) {
  // Card surface: frosted glass. Lighter surface by default; dark variant for
  // busy/dark photos. The image itself is faded on top of a white backdrop so
  // the card always reads cleanly on mobile.
  const cardClass = bgDark
    ? 'backdrop-blur-md bg-slate-900/65 text-slate-50 border border-white/20 shadow-xl'
    : 'backdrop-blur-md bg-white/75 border border-white/60 shadow-xl';

  if (!bg) {
    // Fallback (no bg provided): original plain layout.
    return (
      <main className="min-h-full p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            to="/"
            className="text-blue-600 font-medium min-h-[40px] inline-flex items-center"
            aria-label="Back to home"
          >
            ← Home
          </Link>
          <JapaneseHintToggle />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {title}
          {titleJa && <span className="ml-3 text-base text-slate-500 font-normal">{titleJa}</span>}
        </h1>
        <div className="mt-4">{children}</div>
      </main>
    );
  }

  // Background image fills the viewport; card sits inside with margin off the
  // edges. On mobile we also slightly lower image opacity via a white wash to
  // keep text legible even on high-contrast photos.
  return (
    <div className="relative min-h-screen w-full">
      {/* Layer 1: white wash base (so the image never washes out the card text) */}
      <div className="fixed inset-0 -z-20 bg-white" aria-hidden />
      {/* Layer 2: the image itself — contained (whole image visible, no
          zoom-crop), slightly faded for readability. */}
      <div
        className="fixed inset-0 -z-10 bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: `url('${bg}')`, opacity: 0.7 }}
        aria-hidden
      />

      <main className="min-h-screen p-4 sm:p-8 max-w-3xl mx-auto flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            to="/"
            className={`${bgDark ? 'text-white' : 'text-blue-700'} font-medium min-h-[40px] inline-flex items-center px-3 rounded-full backdrop-blur-sm ${bgDark ? 'bg-slate-900/50' : 'bg-white/70'} shadow-sm`}
            aria-label="Back to home"
          >
            ← Home
          </Link>
          <JapaneseHintToggle />
        </div>

        <section className={`rounded-3xl ${cardClass} p-5 sm:p-8`}>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {title}
            {titleJa && (
              <span className={`ml-3 text-base font-normal ${bgDark ? 'text-slate-200' : 'text-slate-500'}`}>
                {titleJa}
              </span>
            )}
          </h1>
          <div className="mt-4">{children}</div>
        </section>
      </main>
    </div>
  );
}
