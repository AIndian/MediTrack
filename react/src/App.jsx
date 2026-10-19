import { useSyncExternalStore } from 'react';

export default function App({ store }) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return <main>
    <h1>MediTrack</h1>
    <p>Use sample information only. Saved on this device.</p>
    {state.error && <p role="alert">{state.error}</p>}
    <p>{state.medicines.length} medicines saved.</p>
  </main>;
}
