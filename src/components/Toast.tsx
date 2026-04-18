import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info' | 'warn';
type Toast = { id: number; kind: ToastKind; text: string };

type Ctx = {
  push: (kind: ToastKind, text: string, ms?: number) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

const styles: Record<ToastKind, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-rose-600 text-white',
  info: 'bg-slate-800 text-white',
  warn: 'bg-amber-500 text-slate-900',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const push = useCallback((kind: ToastKind, text: string, ms = 1800) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ms);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed inset-x-0 bottom-6 pointer-events-none flex flex-col items-center gap-2 z-50 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 shadow-lg text-base sm:text-lg font-medium max-w-md text-center ${styles[t.kind]}`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): Ctx {
  const v = useContext(ToastCtx);
  if (!v) throw new Error('useToast must be used inside ToastProvider');
  return v;
}
