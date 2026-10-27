import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { StoreContext } from './StoreContext';
import { AppStore } from './store';

const store = new AppStore();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreContext.Provider value={store}>
      <HashRouter><App /></HashRouter>
    </StoreContext.Provider>
  </StrictMode>,
);
