import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { StoreContext } from './StoreContext';
import { AppStore } from './store';
import { ErrorBoundary } from './components/ErrorBoundary';

const store = new AppStore();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
    <StoreContext.Provider value={store}>
      <HashRouter><App /></HashRouter>
    </StoreContext.Provider>
    </ErrorBoundary>
  </StrictMode>,
);
