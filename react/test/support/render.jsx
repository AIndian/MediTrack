import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
import { StoreContext } from '../../src/StoreContext';
import { fresh } from './fixtures';

export function renderApp(store = fresh(), entry = '/') {
  return render(
    <StoreContext.Provider value={store}>
      <MemoryRouter initialEntries={[entry]}>
        <App />
      </MemoryRouter>
    </StoreContext.Provider>,
  );
}
