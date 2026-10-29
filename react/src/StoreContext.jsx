import { createContext, useContext, useSyncExternalStore } from 'react';

export const StoreContext = createContext(null);

export function useStore() {
  const store = useContext(StoreContext);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { store, ...state };
}
