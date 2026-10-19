import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppStore } from './store';

export const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode><App store={new AppStore()} /></StrictMode>,
);
