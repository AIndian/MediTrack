import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ButtonLink, Card, DoseControls, ErrorSummary, Field, MedicineHeading, Page, Status, useStore } from './components';
import { cutoffDay, localDay } from './model';

export function Today() {
  const store = useStore();
  const slots = store.active.flatMap(m => m.times.map(time => ({ medicine: m, time })))
    .sort((a, b) => a.time.localeCompare(b.time));
  const taken = slots.filter(({ medicine, time }) => store.status(store.doseKey(medicine, time)) === 'Taken').length;
  return <Page title="Today" subtitle="Your daily medication plan">
    <p>{store.day}</p>
    <div className="today-grid"><div>
      {!slots.length && <Card><h2>Start your routine</h2><p>No medicines scheduled today. Add your first medicine to get started.</p></Card>}
      {slots.map(({ medicine: m, time }, index) => <div key={`${m.id}-${time}`}>
        {index < 2 && <h2>{index === 0 ? 'Next dose' : 'Later today'}</h2>}
        <Card emphasis={index === 0} label={`${m.name} at ${time}`}>
          <MedicineHeading medicine={m} /><Status value={store.status(store.doseKey(m, time))} />
          <p className="dose-time">{time}</p><p>{m.instructions}</p>
          {index === 0 && <DoseControls key={store.doseKey(m, time)} doseKey={store.doseKey(m, time)} />}
          <ButtonLink to={`/dose/${m.id}/${time}`}>Open {m.name} dose at {time}</ButtonLink>
        </Card>
      </div>)}
      <ButtonLink to="/medicines/new">Add medicine</ButtonLink>
    </div><aside aria-label="Your day overview">
      <Card><h2>Your day, at a glance</h2><p>{taken} of {slots.length} doses recorded Taken</p>
        <progress aria-label="Doses recorded today" max={slots.length || 1} value={taken} />
        <ButtonLink to="/history">View dose history</ButtonLink></Card>
      <Card><p>No connection</p><p className="muted">Records stay on this device. Cloud sync is unavailable.</p></Card>
      <div className="actions"><ButtonLink to="/symptoms">Log symptom</ButtonLink>
        <ButtonLink to="/summary" secondary>Appointment summary</ButtonLink></div>
    </aside></div>
  </Page>;
}

export function Dose() {
  const store = useStore();
  const { id, time } = useParams();
  const medicine = store.state.medicines.find(m => m.id === id && !m.archived && m.times.includes(time));
  if (!medicine) return <Navigate to="/" replace />;
  const key = store.doseKey(medicine, time);
  return <Page title="Medication reminder" subtitle="Name, dose, and saved instructions">
    <Card><MedicineHeading medicine={medicine} /><Status value={store.status(key)} />
      <p>{store.day} at {time}</p><p>{medicine.instructions || 'No instructions entered'}</p>
      <DoseControls key={key} doseKey={key} />
      <ButtonLink to={`/medicines/${id}`} secondary>View medicine details</ButtonLink>
    </Card><p>You can also correct this record later in History.</p>
  </Page>;
}

export function History() {
  const store = useStore();
  const history = store.history(30);
  return <Page title="Dose history" subtitle="Review or correct a record">
    <p>Last 30 days · Select a status to correct an entry.</p>
    {!history.length && <Card><p>No doses recorded yet.</p></Card>}
    {history.map(([key, status]) => <Card key={key} label={store.doseLabel(key)}>
      <h2>{store.doseLabel(key)}</h2><Status value={status} />
      <div className="actions inline">{['Taken', 'Skipped', 'Due'].map(value =>
        <button className="secondary" key={value} onClick={() => store.record(key, value)}>{value}</button>)}</div>
    </Card>)}
  </Page>;
}

export function Symptoms() {
  const store = useStore();
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState('Mild');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  return <Page title="Symptoms" subtitle="Keep a note for your next visit">
    <form noValidate onSubmit={event => {
      event.preventDefault();
      setErrors(name.trim() ? {} : { symptom: 'Enter a symptom' });
      if (name.trim()) {
        const saved = store.symptom(name, severity, notes);
        if (store.loadFailed) return;
        setName(''); setNotes('');
        setMessage(saved ? 'Symptom saved on this device.' : 'Symptom kept in memory. Use Retry save to save it on this device.');
      }
    }}>
      <ErrorSummary errors={errors} />
      <Card>
        <Field name="symptom" label="Symptom" value={name} error={errors.symptom} onChange={event => setName(event.target.value)} />
        <label htmlFor="severity">Severity</label>
        <select id="severity" value={severity} onChange={event => setSeverity(event.target.value)}>
          {['Mild', 'Moderate', 'Severe'].map(value => <option key={value}>{value}</option>)}
        </select>
        <label htmlFor="notes">Notes (optional)</label><textarea id="notes" rows={3} value={notes} onChange={event => setNotes(event.target.value)} />
        <button type="submit">Save symptom</button>
      </Card>
    </form>
    <p role="status">{message}</p>
    {!store.state.symptoms.length && <p>No symptoms recorded.</p>}
    {store.state.symptoms.map((s, index) => <Card key={`${s.date}-${index}`}>
      <h2>{s.name}</h2><p>{s.severity} · {new Date(s.date).toLocaleString()}</p><p>{s.notes}</p>
    </Card>)}
  </Page>;
}

export function Summary() {
  const store = useStore();
  const [days, setDays] = useState(7);
  const history = store.history(days);
  const cutoff = cutoffDay(store.now(), days);
  const symptoms = store.state.symptoms.filter(s => {
    const day = localDay(new Date(s.date));
    return day >= cutoff && day <= store.day;
  });
  return <Page title="Appointment summary" subtitle="A clear view of your recent health">
    <label htmlFor="range">Date range</label><select id="range" value={days} onChange={event => setDays(Number(event.target.value))}>
      <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option>
    </select>
    <Card><h2>Recorded doses</h2><p>{history.filter(([, status]) => status === 'Taken').length} taken of {history.length} recorded doses</p>
      <p>Unrecorded doses are not included in this count.</p></Card>
    <Card><h2>Current medicines</h2>
      {!store.active.length && <p>No active medicines.</p>}
      {store.active.map(m => <p key={m.id}>{m.name} · {m.strength} · {m.times.join(', ')} · Supply: {m.supply}</p>)}
    </Card>
    <Card><h2>Symptoms</h2>{!symptoms.length && <p>No symptoms in this date range.</p>}
      {symptoms.map((s, index) => <p key={`${s.date}-${index}`}>{s.name} · {s.severity} · {s.notes}</p>)}</Card>
    <Card><h2>Dose records</h2>{!history.length && <p>No dose records in this date range.</p>}
      {history.map(([key, status]) => <p key={key}>{store.doseLabel(key)} · {status}</p>)}</Card>
    <p>Allergies and medication changes are not tracked in this build. This summary stays on your device; export and sharing are unavailable.</p>
  </Page>;
}

export function Settings() {
  const store = useStore();
  const scale = store.state.textScale;
  return <Page title="Settings & sharing" subtitle="Your preferences and privacy">
    <Card><h2>Make it comfortable</h2>
      <label className="check-label"><input type="checkbox" checked={scale > 1} onChange={event => store.setLargeText(event.target.checked)} />Larger text</label>
      <p>Quick switch: 100% or 200%</p>
      <label htmlFor="text-size">Text size: {scale * 100}%</label>
      <input type="range" id="text-size" min={1} max={2} step={0.25} value={scale} aria-valuetext={`${scale * 100}%`}
        onChange={event => store.setTextScale(Number(event.target.value))} />
      <p>100% · 125% · 150% · 175% · 200%</p><p>Browser text and zoom settings still apply.</p>
    </Card>
    <div className="actions"><ButtonLink to="/symptoms">Symptoms</ButtonLink><ButtonLink to="/summary">Appointment summary</ButtonLink></div>
    <Card><h2>Reminders</h2><p>Reminders are off.</p></Card>
    <Card><h2>Privacy & sharing</h2><p>Saved on this device. Sharing is off.</p></Card>
    <p>Prototype storage is not encrypted. Use sample information only.</p>
  </Page>;
}
