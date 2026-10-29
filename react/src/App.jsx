import { useContext, useSyncExternalStore } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { StoreContext } from './StoreContext';
import { StorageNotice } from './components/StorageNotice';
import { HeaderClock, useCurrentTime } from './components/HeaderClock';
import { Page } from './components/Page';
import { Today } from './screens/Today';
import { Medicines, MedicineDetails } from './screens/Medicines';
import { MedicineForm, MedicineReview } from './screens/MedicineFlow';
import { Dose, History } from './screens/Doses';
import { Symptoms, Summary, Settings } from './screens/More';
import './styles.css';

export default function App() {
  const store = useContext(StoreContext);
  const textScale = useSyncExternalStore(store.subscribe, () => store.getSnapshot().textScale);
  const date = useCurrentTime(store.now);
  return (
    <div className="app" style={{ '--text-scale': textScale }}>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main').focus();
        }}
      >
        Skip to content
      </a>
      <header className="app-header">
        <Link className="brand" to="/" aria-label="MediTrack home">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10.5,13H8v-3h2.5V7.5h3V10H16v3h-2.5v2.5h-3V13z M12,2L4,5v6.09c0,5.05,3.41,9.76,8,10.91c4.59-1.15,8-5.86,8-10.91V5L12,2 z M18,11.09c0,4-2.55,7.7-6,8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6,2.25V11.09z" />
          </svg>
          <span>MediTrack</span>
        </Link>
        <HeaderClock date={date} />
      </header>
      <StorageNotice />
      <div className="app-layout">
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Today
          </NavLink>
          <NavLink to="/medicines">Medicines</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/settings">More</NavLink>
          <p>
            Your routine,
            <br />
            at your pace.
          </p>
        </nav>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/medicines/new" element={<MedicineForm />} />
          <Route path="/medicines/review" element={<MedicineReview />} />
          <Route path="/medicines/:id" element={<MedicineDetails />} />
          <Route path="/medicines/:id/edit" element={<MedicineForm />} />
          <Route path="/dose/:id/:time" element={<Dose />} />
          <Route path="/history" element={<History />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={
              <Page title="Page not found">
                <p>This page is unavailable.</p>
                <Link to="/">Go to Today</Link>
              </Page>
            }
          />
        </Routes>
      </div>
      <footer>Prototype only · Use sample information · Storage is not encrypted</footer>
    </div>
  );
}
