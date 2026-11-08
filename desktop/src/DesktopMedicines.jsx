import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../react/src/StoreContext';
import { MedicineHeading, Page } from '../../react/src/components/Page';

export function DesktopMedicines() {
  const { medicines } = useStore();
  const [query, setQuery] = useState('');
  const search = useRef(null);
  const location = useLocation();
  useEffect(() => {
    if (location.state?.focusSearch) search.current.focus();
  }, [location]);
  const filtered = medicines.filter((medicine) => medicine.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Page title="Your medicines">
      <div className="field">
        <label htmlFor="medicine-search">Find medicine</label>
        <input
          id="medicine-search"
          type="search"
          ref={search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <p role="status">
        {filtered.length} {filtered.length === 1 ? 'medicine' : 'medicines'} found
      </p>
      {medicines.length === 0 && <p>Your medicine list is empty. Use Add medicine to start.</p>}
      {medicines.length > 0 && filtered.length === 0 && <p>No medicines match. Try another name.</p>}
      <div className="medicine-grid">
        {filtered.map((medicine) => (
          <article className="card" key={medicine.id}>
            <MedicineHeading medicine={medicine} />
            <p>Daily at {medicine.times.join(', ')}</p>
            <p className="badge">{medicine.archived ? 'Archived' : 'Active'}</p>
            {!medicine.archived && medicine.supply <= 10 && (
              <p className="supply-note">Low supply · Check your refill</p>
            )}
            <Link className="button secondary" to={`/medicines/${encodeURIComponent(medicine.id)}`}>
              Open {medicine.name}
            </Link>
          </article>
        ))}
      </div>
    </Page>
  );
}
