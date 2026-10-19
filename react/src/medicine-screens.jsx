import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ButtonLink, Card, ErrorSummary, Field, MedicineHeading, Page, useStore } from './components';
import { medicineFromFields, validateMedicine } from './model';

export function Medicines() {
  const store = useStore();
  return <Page title="Your medicines" subtitle="All your information, in one place">
    <p>{store.active.length} active medicines</p>
    <ButtonLink to="/medicines/new">Add medicine</ButtonLink>
    {!store.state.medicines.length && <p>Your medicine list is empty.</p>}
    {store.state.medicines.map(m => <Card key={m.id} label={m.name}>
      <MedicineHeading medicine={m} />
      <p>Daily at {m.times.join(', ')}</p><p>{m.archived ? 'Archived' : 'Active'}</p>
      {m.supply <= 10 && <p className="low-supply">Low supply · Check your refill</p>}
      <ButtonLink to={`/medicines/${m.id}`}>Open {m.name}</ButtonLink>
    </Card>)}
  </Page>;
}

export function MedicineDetails() {
  const store = useStore();
  const { id } = useParams();
  const m = store.state.medicines.find(m => m.id === id);
  if (!m) return <Navigate to="/medicines" replace />;
  return <Page title="Medicine details" subtitle="Review your saved information">
    <Card>
      <MedicineHeading medicine={m} />
      <h3>Instructions you entered</h3><p>{m.instructions || 'None entered'}</p>
      <h3>Schedule</h3><p>Daily at {m.times.join(', ')}</p>
      <p>{m.archived ? 'Archived — no longer scheduled' : 'Active'}</p>
    </Card>
    <Card><h2>Refill details</h2><p>Recorded supply: {m.supply} doses</p><p>Low-supply threshold: 10 doses</p></Card>
    <div className="actions">
      <ButtonLink to={`/medicines/${id}/edit`}>Edit medicine</ButtonLink>
      <button className="secondary" onClick={() => store.archive(m)}>{m.archived ? 'Restore medicine' : 'Archive medicine'}</button>
    </div>
  </Page>;
}

export function MedicineFlow() {
  const store = useStore();
  const { id } = useParams();
  const medicine = store.state.medicines.find(m => m.id === id);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [draftId] = useState(() => id ?? crypto.randomUUID());
  const [fields, setFields] = useState(() => ({
    name: medicine?.name ?? '', strength: medicine?.strength ?? '', instructions: medicine?.instructions ?? '',
    times: medicine?.times.join(', ') ?? '08:00', supply: String(medicine?.supply ?? 30),
  }));
  const [errors, setErrors] = useState({});
  const formPath = id ? `/medicines/${id}/edit` : '/medicines/new';
  const reviewing = pathname.endsWith('/review');
  if (id && !medicine) return <Navigate to="/medicines" replace />;
  if (reviewing) {
    if (Object.keys(validateMedicine(fields)).length) return <Navigate to={formPath} replace />;
    const draft = medicineFromFields(fields, draftId, medicine?.archived ?? false);
    return <Page title="Review medicine" subtitle="Step 2 of 2 · Check before saving">
      <Card><MedicineHeading medicine={draft} /><p>{draft.instructions || 'No instructions entered'}</p>
        <p>Every day at {draft.times.join(', ')}</p><p>{draft.supply} doses recorded</p></Card>
      <p>Check these details against your prescription before saving.</p>
      <div className="actions">
        <button onClick={() => { if (store.put(draft)) navigate(id ? `/medicines/${id}` : '/medicines', { replace: true }); }}>Save medicine</button>
        <ButtonLink to={formPath} secondary>Edit details</ButtonLink>
      </div>
    </Page>;
  }
  return <Page title={id ? 'Edit medicine' : 'Add medicine'} subtitle="Step 1 of 2 · Enter details">
    <p>Copy details from your prescription label. Times use the 24-hour clock.</p>
    <form noValidate onSubmit={event => {
      event.preventDefault();
      const nextErrors = validateMedicine(fields);
      setErrors(nextErrors);
      if (!Object.keys(nextErrors).length) navigate(`${formPath}/review`);
    }}>
      <ErrorSummary errors={errors} />
      <Card>
        <h2>Medicine information</h2>
        {[
          ['name', 'Medicine name'], ['strength', 'Strength / dosage'], ['instructions', 'Instructions (optional)'],
          ['times', 'Daily times (HH:mm, separated by commas)'], ['supply', 'Supply in doses'],
        ].map(([key, label]) => <Field key={key} name={key} label={label} value={fields[key]} error={errors[key]}
          inputMode={key === 'supply' ? 'numeric' : 'text'}
          onChange={event => setFields({ ...fields, [key]: event.target.value })} />)}
      </Card>
      <button type="submit">Review medicine</button>
    </form>
  </Page>;
}
