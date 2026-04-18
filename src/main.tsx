import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { HintProvider } from './lib/hint-context';
import { ToastProvider } from './components/Toast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <HintProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </HintProvider>
    </BrowserRouter>
  </StrictMode>,
);
