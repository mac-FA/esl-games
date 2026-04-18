import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadJSON, saveJSON } from './storage';

type HintCtx = {
  hintsOn: boolean;
  setHintsOn: (on: boolean) => void;
  toggle: () => void;
};

const Ctx = createContext<HintCtx | null>(null);
const KEY = 'hintsOn';

export function HintProvider({ children }: { children: ReactNode }) {
  const [hintsOn, setHintsOnState] = useState<boolean>(() => loadJSON<boolean>(KEY, false));

  useEffect(() => {
    saveJSON(KEY, hintsOn);
  }, [hintsOn]);

  const setHintsOn = (on: boolean) => setHintsOnState(on);
  const toggle = () => setHintsOnState((v) => !v);

  return <Ctx.Provider value={{ hintsOn, setHintsOn, toggle }}>{children}</Ctx.Provider>;
}

export function useHints(): HintCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHints must be used inside HintProvider');
  return v;
}
