import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AppStore } from '../../react/src/store';
import { StoreContext } from '../../react/src/StoreContext';
import { ErrorBoundary } from '../../react/src/components/ErrorBoundary';
import DesktopApp from './DesktopApp';
import '../../react/src/styles.css';
import './desktop.css';

const store = new AppStore();
const router = createHashRouter([{ path: '*', element: <DesktopApp /> }]);
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <StoreContext.Provider value={store}>
      <RouterProvider router={router} />
    </StoreContext.Provider>
  </ErrorBoundary>,
);
