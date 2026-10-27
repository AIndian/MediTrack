import { useStore } from './StoreContext';
import { StorageNotice } from './components/StorageNotice';

export default function App() {
  const { medicines } = useStore();
  return <main id="main" tabIndex={-1}>
    <h1>MediTrack</h1>
    <p>React implementation · Local records</p>
    <StorageNotice />
    <p>{medicines.length} medicines saved in this browser.</p>
    <p>Prototype storage is not encrypted. Use sample information only.</p>
  </main>;
}
