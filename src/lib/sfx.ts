/**
 * Tiny SFX library — matches the retro tones from /public/legacy/daves-day.html
 * and grammar-quest.html so the whole site has a consistent 8-bit-ish feel.
 *
 * No external files: everything is synthesized with the WebAudio API on
 * demand. Browsers require a user gesture before audio can play, so the
 * first `play()` call will lazily construct the AudioContext.
 *
 * Usage:
 *   import { sfx } from '../../lib/sfx';
 *   sfx('correct');
 */

type SfxName = 'correct' | 'wrong' | 'win' | 'fail' | 'tick' | 'pick' | 'tap';

let ctx: AudioContext | null = null;
let unlocked = false;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const Ctor =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx && ctx.state === 'suspended') {
    // Safe to call even if not gesture-triggered — it just no-ops there.
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Attach once on app mount: the first pointerdown/keydown resumes audio,
 *  which is required by Chrome/Safari autoplay policies. */
export function installAudioUnlock() {
  if (typeof window === 'undefined' || unlocked) return;
  const unlock = () => {
    unlocked = true;
    getCtx(); // create + resume
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

/** Play a named sound. Silent failure if audio isn't available. */
export function sfx(name: SfxName) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  try {
    const t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g);
    g.connect(c.destination);

    switch (name) {
      case 'correct': {
        // Rising arpeggio (C5 → E5 → G5), square wave.
        osc.type = 'square';
        osc.frequency.setValueAtTime(523, t);
        osc.frequency.setValueAtTime(659, t + 0.08);
        osc.frequency.setValueAtTime(784, t + 0.16);
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'wrong': {
        // Falling sawtooth buzz.
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.25);
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'win': {
        // Fanfare up to C6.
        osc.type = 'square';
        osc.frequency.setValueAtTime(523, t);
        osc.frequency.setValueAtTime(659, t + 0.1);
        osc.frequency.setValueAtTime(784, t + 0.2);
        osc.frequency.setValueAtTime(1047, t + 0.3);
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.start(t);
        osc.stop(t + 0.55);
        break;
      }
      case 'fail': {
        // Sad descending sawtooth.
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.setValueAtTime(250, t + 0.15);
        osc.frequency.setValueAtTime(200, t + 0.3);
        osc.frequency.linearRampToValueAtTime(80, t + 0.5);
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.start(t);
        osc.stop(t + 0.55);
        break;
      }
      case 'tick': {
        // Short high blip — countdown warning.
        osc.type = 'square';
        osc.frequency.value = 880;
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.07);
        break;
      }
      case 'pick': {
        // Neutral selection blip.
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.linearRampToValueAtTime(660, t + 0.08);
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }
      case 'tap': {
        // Subtle UI tap.
        osc.type = 'square';
        osc.frequency.value = 220;
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }
    }
  } catch {
    // ignore
  }
}
