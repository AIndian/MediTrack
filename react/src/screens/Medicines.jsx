import { Link, useParams } from 'react-router-dom';
import { useStore } from '../StoreContext';
import { MedicineHeading, Page } from '../components/Page';

export function Medicines() {
  const { store, medicines } = useStore();
  return <Page title="Your medicines">
    <p>{store.active.length} active medicines</p>
    <Link className="button" to="/medicines/new">Add medicine</Link>
    {medicines.length === 0 && <p>Your medicine list is empty.</p>}
    {medicines.map((medicine) => <article className="card" key={medicine.id}>
      <MedicineHeading medicine={medicine} />
      <p>Daily at {medicine.times.join(', ')}</p>
      <p className="badge">{medicine.archived ? 'Archived' : 'Active'}</p>
      {!medicine.archived && medicine.supply <= 10 && <p className="supply-note">Low supply · Check your refill</p>}
      <Link className="button secondary" to={`/medicines/${encodeURIComponent(medicine.id)}`}>Open {medicine.name}</Link>
    </article>)}
  </Page>;
}

export function MedicineDetails() {
  const { id } = useParams();
  const { store, medicines, readOnly } = useStore();
  const medicine = medicines.find((m) => m.id === id);
  if (!medicine) return <Page title="Medicine details" backTo="/medicines"><p>Medicine not found.</p></Page>;
  return <Page title="Medicine details" backTo="/medicines">
    <div className="card">
      <MedicineHeading medicine={medicine} />
      <h2>Instructions you entered</h2><p>{medicine.instructions || 'None entered'}</p>
      <h2>Schedule</h2><p>Daily at {medicine.times.join(', ')}</p>
      <p className="badge">{medicine.archived ? 'Archived — no longer scheduled' : 'Active'}</p>
    </div>
    <section className="card"><h2>Refill details</h2><p>Recorded supply: {medicine.supply} doses</p><p>Low-supply threshold: 10 doses. Recording a dose does not change this count.</p></section>
    <Link className="button" to={`/medicines/${encodeURIComponent(id)}/edit`}>Edit medicine</Link>
    <button disabled={readOnly} className="secondary" onClick={() => store.archive(medicine)}>{medicine.archived ? 'Restore medicine' : 'Archive medicine'}</button>
  </Page>;
}
