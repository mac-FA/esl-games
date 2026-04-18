import { useHints } from '../lib/hint-context';

type Props = { className?: string };

export default function JapaneseHintToggle({ className = '' }: Props) {
  const { hintsOn, toggle } = useHints();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={hintsOn}
      aria-label={hintsOn ? 'Turn off Japanese hints' : 'Turn on Japanese hints'}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium min-h-[40px] active:scale-[0.97] transition ${className}`}
    >
      <span className={hintsOn ? 'text-slate-400' : 'text-slate-900 font-bold'}>EN</span>
      <span
        className={`w-9 h-5 rounded-full relative transition ${hintsOn ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${hintsOn ? 'translate-x-4' : ''}`}
        />
      </span>
      <span className={hintsOn ? 'text-slate-900 font-bold' : 'text-slate-400'}>日本語</span>
    </button>
  );
}
