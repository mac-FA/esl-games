import { useState, type ReactNode, type FormEvent } from 'react';
import { useUser, USERNAME_MAX } from '../lib/user-context';
import HintText from './HintText';
import Button from './Button';

/** Blocks rendering of children until the user has entered a session name. */
export default function NameGate({ children }: { children: ReactNode }) {
  const { name, setName } = useUser();
  const [value, setValue] = useState('');

  if (name) return <>{children}</>;

  const trimmed = value.trim();
  const valid = trimmed.length > 0 && trimmed.length <= USERNAME_MAX;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (valid) setName(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
        aria-label="Enter your name"
      >
        <h2 className="text-2xl font-bold">Welcome!</h2>
        <HintText ja="ようこそ！" />
        <p className="mt-3 text-slate-700">
          What's your name? It goes next to your high scores.
        </p>
        <HintText ja="ハイスコアに載せる名前を入力してください。日本語でもOK（15文字まで）。" />
        <label className="block mt-4">
          <span className="sr-only">Your name</span>
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, USERNAME_MAX))}
            maxLength={USERNAME_MAX}
            className="w-full px-3 py-3 rounded-xl border border-slate-300 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            placeholder="Your name / お名前"
            aria-label="Your name"
            enterKeyHint="go"
          />
        </label>
        <p className="text-xs text-slate-500 mt-1" aria-live="polite">
          {trimmed.length} / {USERNAME_MAX}
        </p>
        <div className="mt-5 flex justify-end">
          <Button type="submit" size="lg" variant="primary" disabled={!valid}>
            Start
          </Button>
        </div>
      </form>
    </div>
  );
}
