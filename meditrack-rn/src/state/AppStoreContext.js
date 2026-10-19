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

const noopSubscribe = () => () => {};

// Safe to use even outside the provider (returns 1.0 there)
export function useTextScale() {
  const store = useContext(AppStoreContext);
  useSyncExternalStore(store ? store.subscribe : noopSubscribe, () => (store ? store.version : 0));
  return store ? store.textScale : 1;
}