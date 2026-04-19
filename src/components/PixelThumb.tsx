import { useEffect, useRef } from 'react';

/** Replicates the drawDave() sprite from /public/legacy/daves-day.html so the
 *  home card shows the same 16x16 pixel figure the game uses. */
function drawDave(c: CanvasRenderingContext2D) {
  c.clearRect(0, 0, 16, 16);
  c.fillStyle = '#654321'; c.fillRect(5, 0, 6, 2);                              // hair
  c.fillStyle = '#FFD6A0'; c.fillRect(5, 2, 6, 5);                              // face
  c.fillStyle = '#222';    c.fillRect(6, 3, 2, 2); c.fillRect(9, 3, 2, 2);      // eyes
  c.fillStyle = '#e74c3c'; c.fillRect(7, 5, 2, 1);                              // mouth
  c.fillStyle = '#3498db'; c.fillRect(4, 7, 8, 4); c.fillRect(2, 7, 2, 3); c.fillRect(12, 7, 2, 3); // shirt + arms
  c.fillStyle = '#8B6914'; c.fillRect(5, 11, 3, 3); c.fillRect(8, 11, 3, 3);    // pants
  c.fillStyle = '#333';    c.fillRect(4, 14, 4, 2); c.fillRect(8, 14, 4, 2);    // shoes
}

/** A tiny 16x16 pixel castle gate — custom sprite in the Dave style, since
 *  the original Grammar Quest uses the 🏰 emoji inline in text. Retro feel. */
function drawCastle(c: CanvasRenderingContext2D) {
  c.clearRect(0, 0, 16, 16);
  // Stone body
  c.fillStyle = '#8a8a9a';
  c.fillRect(1, 5, 14, 10);
  // Darker stone shadow
  c.fillStyle = '#5c5c6c';
  c.fillRect(1, 13, 14, 2);
  // Battlements (top crenellations)
  c.fillStyle = '#8a8a9a';
  c.fillRect(1, 3, 2, 2);
  c.fillRect(4, 3, 2, 2);
  c.fillRect(7, 3, 2, 2);
  c.fillRect(10, 3, 2, 2);
  c.fillRect(13, 3, 2, 2);
  // Side towers
  c.fillStyle = '#6e6e80';
  c.fillRect(0, 4, 2, 11);
  c.fillRect(14, 4, 2, 11);
  c.fillStyle = '#8a8a9a';
  c.fillRect(0, 2, 2, 2);
  c.fillRect(14, 2, 2, 2);
  // Red flags on towers
  c.fillStyle = '#d12d2d';
  c.fillRect(1, 0, 1, 2);
  c.fillRect(15, 0, 1, 2);
  c.fillStyle = '#6b3a1a';
  c.fillRect(0, 0, 1, 3);
  c.fillRect(15, 0, 0, 0); // no-op, just marker
  // Gate arch
  c.fillStyle = '#3a2a1a';
  c.fillRect(6, 8, 4, 7);
  c.fillStyle = '#2a1a0a';
  c.fillRect(6, 8, 4, 1);
  // Portcullis bars
  c.fillStyle = '#7a6a4a';
  c.fillRect(7, 9, 1, 5);
  c.fillRect(9, 9, 1, 5);
  c.fillRect(6, 11, 4, 1);
  // Small window
  c.fillStyle = '#ffd24a';
  c.fillRect(3, 8, 2, 2);
  c.fillRect(11, 8, 2, 2);
}

type Which = 'dave' | 'castle';

export default function PixelThumb({ which, size = 96 }: { which: Which; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    if (which === 'dave') drawDave(ctx);
    else drawCastle(ctx);
  }, [which]);
  return (
    <canvas
      ref={ref}
      width={16}
      height={16}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
      aria-hidden
    />
  );
}
