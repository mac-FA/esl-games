import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { HintProvider } from './lib/hint-context';
import { UserProvider } from './lib/user-context';
import { ToastProvider } from './components/Toast';
import NameGate from './components/NameGate';
import { clearLegacyBestKeys } from './lib/scoreboard';
import './index.css';

// One-time cleanup of pre-scoreboard `<game>:best` keys.
clearLegacyBestKeys();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <HintProvider>
        <UserProvider>
          <ToastProvider>
            <NameGate>
              <App />
            </NameGate>
          </ToastProvider>
        </UserProvider>
      </HintProvider>
    </BrowserRouter>
  </StrictMode>,
);
