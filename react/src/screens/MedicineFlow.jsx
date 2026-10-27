import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../StoreContext';
import { validateMedicine } from '../store';
import { MedicineHeading, Page } from '../components/Page';

const fields = [
  ['name', 'Medicine name'],
  ['strength', 'Strength / dosage'],
  ['instructions', 'Instructions (optional)'],
  ['times', 'Daily times (HH:mm, separated by commas)'],
  ['supply', 'Supply in doses'],
];

export function MedicineForm() {
  const { id } = useParams();
  const { medicines } = useStore();
  const medicine = medicines.find((m) => m.id === id);
  if (id && !medicine) return <Page title="Edit medicine" backTo="/medicines"><p>Medicine not found.</p></Page>;
  return <MedicineEditor key={id ?? 'new'} medicine={medicine} />;
}

function MedicineEditor({ medicine }) {
  const { readOnly } = useStore();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [draft] = useState(() => state?.draft ?? medicine ?? { id: crypto.randomUUID(), name: '', strength: '', instructions: '', times: ['08:00'], supply: 30, archived: false });
  const [values, setValues] = useState(() => ({ ...draft, times: draft.times.join(', '), supply: String(draft.supply) }));
  const [errors, setErrors] = useState({});
  const formPath = medicine ? `/medicines/${encodeURIComponent(medicine.id)}/edit` : '/medicines/new';
  const backTo = medicine ? `/medicines/${encodeURIComponent(medicine.id)}` : '/medicines';
  function review(event) {
    event.preventDefault();
    const errors = validateMedicine(values);
    setErrors(errors);
    if (Object.keys(errors).length) {
      document.getElementById(`medicine-${Object.keys(errors)[0]}`).focus();
      return;
    }
    navigate('/medicines/review', { state: { formPath, draft: {
      ...draft, name: values.name.trim(), strength: values.strength.trim(), instructions: values.instructions.trim(),
      times: values.times.split(',').map((time) => time.trim()).sort(), supply: Number(values.supply.trim()),
    } } });
  }
  return <Page title={medicine ? 'Edit medicine' : 'Add medicine'} backTo={backTo}>
    <p>Copy details from your prescription label. Times use the 24-hour clock.</p>
    <form noValidate onSubmit={review}>
      <fieldset disabled={readOnly}><legend>Medicine information</legend>
        {fields.map(([key, label]) => <div className="field" key={key}>
          <label htmlFor={`medicine-${key}`}>{label}</label>
          <input id={`medicine-${key}`} name={key} value={values[key]} required={key !== 'instructions'}
            inputMode={key === 'supply' ? 'numeric' : undefined} aria-invalid={Boolean(errors[key])}
            aria-describedby={errors[key] ? `error-${key}` : undefined}
            onChange={(event) => setValues({ ...values, [key]: event.target.value })} />
          {errors[key] && <p className="field-error" id={`error-${key}`}>{errors[key]}</p>}
        </div>)}
        <button type="submit">Review medicine</button>
      </fieldset>
    </form>
  </Page>;
}

export function MedicineReview() {
  const { state } = useLocation();
  const { store, readOnly } = useStore();
  const navigate = useNavigate();
  const draft = state?.draft;
  if (!draft) return <Page title="Review medicine" backTo="/medicines"><p>No medicine is waiting for review.</p><Link to="/medicines/new">Add medicine</Link></Page>;
  const formPath = state.formPath ?? '/medicines/new';
  return <Page title="Review medicine" backTo={formPath} backState={{ draft }}>
    <div className="card"><MedicineHeading medicine={draft} />
      <p>{draft.instructions || 'No instructions entered.'}</p>
      <p>Every day at {draft.times.join(', ')}</p><p>{draft.supply} doses recorded</p>
    </div>
    <p>Check these details against your prescription before saving.</p>
    <button disabled={readOnly} onClick={() => {
      if (store.put(draft)) navigate(`/medicines/${encodeURIComponent(draft.id)}`, { replace: true });
    }}>Save medicine</button>
    <Link className="button secondary" to={formPath} state={{ draft }} replace>Edit details</Link>
  </Page>;
}
