import React, { createContext, useContext, useSyncExternalStore } from 'react';

const AppStoreContext = createContext(null);

export function AppStoreProvider({ store, children }) {
  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(AppStoreContext);
  if (!store) {
    throw new Error('useAppStore must be used inside AppStoreProvider');
  }
  useSyncExternalStore(store.subscribe, () => store.version);
  return store;
}