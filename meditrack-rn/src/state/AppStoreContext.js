import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { localDate } from './AppStore';

const AppStoreContext = createContext(null);
const noopSubscribe = () => () => {};
const defaultNow = () => new Date();

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

// Returns the store, or null outside the provider (never throws)
export function useOptionalStore() {
  const store = useContext(AppStoreContext);
  useSyncExternalStore(store ? store.subscribe : noopSubscribe, () => (store ? store.version : 0));
  return store;
}

export function useTextScale() {
  const store = useOptionalStore();
  return store ? store.textScale : 1;
}

// Re-renders when the local date changes (past midnight, or back from the background)
// so dose keys never point at yesterday
export function useCurrentDay(now = defaultNow) {
  const [day, setDay] = useState(() => localDate(now()));
  useEffect(() => {
    const check = () => setDay(localDate(now()));
    const timer = setInterval(check, 60 * 1000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [now]);
  return day;
}