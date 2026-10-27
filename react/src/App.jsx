import { useStore } from './StoreContext';

export default function App() {
  const { medicines, error } = useStore();
  return <main>
    <h1>MediTrack</h1>
    <p>React implementation · Local records</p>
    {error && <p role="alert">{error}</p>}
    <p>{medicines.length} medicines saved in this browser.</p>
    <p>Prototype storage is not encrypted. Use sample information only.</p>
  </main>;
}
