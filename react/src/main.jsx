import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppStore } from './store';

createRoot(document.getElementById('root')).render(
  <StrictMode><App store={new AppStore()} /></StrictMode>,
);
