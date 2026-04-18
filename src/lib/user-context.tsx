import { createContext, useContext, useState, type ReactNode } from 'react';

type UserCtx = {
  name: string | null;
  setName: (n: string) => void;
  changeName: () => void; // clear to re-trigger the gate
};

export const USERNAME_MAX = 15;

const Ctx = createContext<UserCtx>({
  name: null,
  setName: () => {},
  changeName: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  // Session-scoped only: not persisted. Each fresh page load asks again.
  const [name, setNameState] = useState<string | null>(null);

  const setName = (n: string) => {
    const trimmed = n.trim().slice(0, USERNAME_MAX);
    if (trimmed) setNameState(trimmed);
  };
  const changeName = () => setNameState(null);

  return <Ctx.Provider value={{ name, setName, changeName }}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}
