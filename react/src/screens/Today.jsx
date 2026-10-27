import { Link } from 'react-router-dom';
import { useStore } from '../StoreContext';
import { MedicineHeading, Page } from '../components/Page';
import { DoseControls } from '../components/DoseControls';

export function Today() {
  const { store } = useStore();
  const now = store.now();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const slots = store.active.flatMap((medicine) => medicine.times.map((time) => ({ medicine, time, key: store.doseKey(medicine, time) })))
    .sort((a, b) => a.time.localeCompare(b.time));
  const taken = slots.filter((slot) => store.status(slot.key) === 'Taken').length;
  const next = slots.find((slot) => store.status(slot.key) === 'Due' && slot.time >= currentTime);
  return <Page title="Today">
    <p className="eyebrow">{store.day} · Your daily routine</p>
    <div className="today-layout">
      <section aria-label="Today's medicines">
        {slots.length === 0 && <div className="card"><h2>A little help with your routine</h2><p>No medicines scheduled today. Add your first medicine to get started.</p></div>}
        {slots.map(({ medicine, time, key }) => <article key={key} className={`card ${next?.key === key ? 'emphasis' : ''}`} aria-label={`${medicine.name} at ${time}`}>
          {next?.key === key && <p className="eyebrow">Next dose</p>}
          {time < currentTime && store.status(key) === 'Due' && <p className="eyebrow">Not recorded yet</p>}
          <MedicineHeading medicine={medicine} />
          <p className="dose-time">{time}</p>
          <p>{medicine.instructions || 'No instructions entered.'}</p>
          <DoseControls key={key} doseKey={key} />
          <Link className="button secondary" to={`/dose/${encodeURIComponent(medicine.id)}/${time}`}>Open {medicine.name} dose at {time}</Link>
        </article>)}
        <Link className="button" to="/medicines/new">Add medicine</Link>
      </section>
      <aside aria-label="Day summary">
        <div className="card"><h2>Your day, at a glance</h2>
          <p>{taken} of {slots.length} doses recorded Taken</p>
          <progress value={taken} max={slots.length || 1} aria-label="Doses recorded today" aria-valuetext={`${taken} of ${slots.length} doses recorded Taken`} />
          <Link className="button secondary" to="/history">View dose history</Link>
        </div>
        <div className="card"><h2>Saved on this device</h2><p>Your records stay in this browser. Sync is off.</p></div>
        <Link className="button secondary" to="/symptoms">Log symptom</Link>
        <Link className="button secondary" to="/summary">Appointment summary</Link>
      </aside>
    </div>
  </Page>;
}
