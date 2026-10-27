import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../StoreContext';
import { Page } from '../components/Page';

export function Symptoms() {
  const { store, symptoms, readOnly } = useStore();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!data.get('name').trim()) {
      setError('Enter a symptom');
      form.elements.name.focus();
      return;
    }
    const saved = store.symptom(data.get('name'), data.get('severity'), data.get('notes'));
    setError('');
    setMessage(saved ? 'Symptom saved on this device.' : 'Symptom added in this tab. Saving has failed.');
    form.reset();
  }
  return (
    <Page title="Symptoms" backTo="/settings">
      <form noValidate onSubmit={submit}>
        <fieldset disabled={readOnly}>
          <legend>Record a symptom</legend>
          <div className="field">
            <label htmlFor="symptom-name">Symptom</label>
            <input
              id="symptom-name"
              name="name"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'symptom-error' : undefined}
            />
            {error && (
              <p id="symptom-error" className="field-error">
                {error}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="severity">Severity</label>
            <select id="severity" name="severity">
              {['Mild', 'Moderate', 'Severe'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea id="notes" name="notes" rows={3} />
          </div>
          <button type="submit">Save symptom</button>
        </fieldset>
      </form>
      <p role="status">{message}</p>
      {symptoms.length === 0 && <p>No symptoms recorded.</p>}
      {symptoms.map((s, index) => (
        <article className="card" key={`${s.date}-${index}`}>
          <h2>{s.name}</h2>
          <p>
            {s.severity} · <time dateTime={s.date}>{new Date(s.date).toLocaleString()}</time>
          </p>
          <p>{s.notes}</p>
        </article>
      ))}
    </Page>
  );
}

export function Summary() {
  const { store, symptoms } = useStore();
  const [days, setDays] = useState(7);
  const history = store.history(days);
  const daily = store.active.reduce((total, medicine) => total + medicine.times.length, 0);
  const taken = history.filter(([, value]) => value === 'Taken').length;
  const recordedSymptoms = symptoms.filter((s) => store.inRange(s.date, days));
  return (
    <Page title="Appointment summary" backTo="/settings">
      <div className="field">
        <label htmlFor="date-range">Date range</label>
        <select id="date-range" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>
      <section className="card">
        <h2>Recorded doses</h2>
        <p>
          {taken} recorded Taken · {history.length - taken} recorded Skipped
        </p>
        <p>
          <strong>
            Current schedule estimate: {daily * days} doses over {days} days
          </strong>{' '}
          ({daily} per day).
        </p>
        <p>
          The estimate applies today’s active schedule to every selected day. Past schedule changes and medicine start
          dates are not tracked. Unrecorded doses are not included in the recorded counts.
        </p>
      </section>
      <section className="card">
        <h2>Current medicines</h2>
        {store.active.length === 0 && <p>No active medicines.</p>}
        {store.active.map((m) => (
          <p key={m.id}>
            {m.name} · {m.strength} · {m.times.join(', ')} · Supply: {m.supply}
          </p>
        ))}
      </section>
      <section className="card">
        <h2>Symptoms</h2>
        {recordedSymptoms.length === 0 && <p>No symptoms in this date range.</p>}
        {recordedSymptoms.map((s, i) => (
          <p key={`${s.date}-${i}`}>
            {s.name} · {s.severity} · {new Date(s.date).toLocaleString()} · {s.notes}
          </p>
        ))}
      </section>
      <section className="card">
        <h2>Dose records</h2>
        {history.length === 0 && <p>No doses in this date range.</p>}
        {history.map(([key, value]) => (
          <p key={key}>
            {store.doseLabel(key)} · {value}
          </p>
        ))}
      </section>
      <p>
        Allergies and medication changes are not tracked in this build. This summary stays on your device; export and
        sharing are unavailable.
      </p>
    </Page>
  );
}

export function Settings() {
  const { store, textScale, readOnly } = useStore();
  return (
    <Page title="Settings & sharing">
      <section className="card">
        <h2>Appearance & accessibility</h2>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={textScale > 1}
            disabled={readOnly}
            onChange={(e) => store.setLargeText(e.target.checked)}
          />
          <span>
            Larger text <small>Quick switch: 100% or 200%</small>
          </span>
        </label>
        <label htmlFor="text-size">Text size: {textScale * 100}%</label>
        <input
          id="text-size"
          type="range"
          min={1}
          max={2}
          step={0.25}
          value={textScale}
          aria-valuetext={`${textScale * 100}%`}
          disabled={readOnly}
          onChange={(e) => store.setTextScale(Number(e.target.value))}
        />
        <p>100% · 125% · 150% · 175% · 200%</p>
        <p>Your browser’s larger text setting still applies.</p>
      </section>
      <Link className="button secondary" to="/symptoms">
        Symptoms
      </Link>
      <Link className="button secondary" to="/summary">
        Appointment summary
      </Link>
      <section className="card">
        <h2>Reminders</h2>
        <p>Reminders are off. Browser and spoken notifications are unavailable.</p>
      </section>
      <section className="card">
        <h2>Privacy & sharing</h2>
        <p>Saved on this device. Sharing, cloud sync and caregiver access are off.</p>
        <p>Prototype storage is not encrypted. Use sample information only.</p>
      </section>
    </Page>
  );
}
