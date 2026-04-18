import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import JapaneseHintToggle from './JapaneseHintToggle';

type Props = {
  title: string;
  titleJa?: string;
  children: ReactNode;
};

export default function GameShell({ title, titleJa, children }: Props) {
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
