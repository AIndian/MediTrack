import { Link, useParams } from 'react-router-dom';
import { useStore } from '../StoreContext';
import { DoseControls } from '../components/DoseControls';
import { MedicineHeading, Page } from '../components/Page';

export function Dose() {
  const { id, time } = useParams();
  const { store, medicines } = useStore();
  const medicine = medicines.find((m) => m.id === id);
  if (!medicine || medicine.archived || !medicine.times.includes(time)) {
    return <Page title="Medication reminder" backTo="/"><p>This dose is no longer scheduled. Review your current medicines.</p><Link to="/medicines">Your medicines</Link></Page>;
  }
  const key = store.doseKey(medicine, time);
  return <Page title="Medication reminder" backTo="/">
    <article className="card emphasis"><MedicineHeading medicine={medicine} />
      <p className="dose-time">{store.day} at {time}</p><p>{medicine.instructions || 'No instructions entered.'}</p>
      <DoseControls key={key} doseKey={key} />
      <Link className="button secondary" to={`/medicines/${encodeURIComponent(id)}`}>View medicine details</Link>
    </article><p>You can also correct this record later in History.</p>
  </Page>;
}

export function History() {
  const { store, readOnly } = useStore();
  const history = store.history(30);
  return <Page title="Dose history">
    <p>Last 30 days · Select a status to correct an entry. Due removes the record.</p>
    {history.length === 0 && <p>No doses recorded yet.</p>}
    {history.map(([key, value]) => <article className="card" key={key} aria-label={store.doseLabel(key)}>
      <h2>{store.doseLabel(key)}</h2><p role="status">Status: {value}</p>
      <div className="actions" role="group" aria-label={`Correct ${store.doseLabel(key)}`}>
        {['Taken', 'Skipped', 'Due'].map((status) => <button key={status} disabled={readOnly} className="secondary" aria-pressed={status === value} onClick={() => store.record(key, status)}>{status}</button>)}
      </div>
    </article>)}
  </Page>;
}
