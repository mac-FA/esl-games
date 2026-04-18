import { useHints } from '../lib/hint-context';

type Props = {
  ja: string;
  className?: string;
};

export default function HintText({ ja, className = '' }: Props) {
  const { hintsOn } = useHints();
  if (!hintsOn) return null;
  return <span className={`block text-slate-500 text-sm mt-1 ${className}`}>{ja}</span>;
}
