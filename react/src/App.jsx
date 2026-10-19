import { useState, useSyncExternalStore } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { HeaderClock, Page, StoreContext } from './components';
import { Medicines, MedicineDetails, MedicineFlow } from './medicine-screens';
import { Today, Dose, History, Symptoms, Summary, Settings } from './routine-screens';
import './styles.css';

function Shell({ store }) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [, setDay] = useState(store.day);
  const { pathname, key } = useLocation();
  const navigate = useNavigate();
  const primary = ['/', '/medicines', '/history', '/more'].includes(pathname);
  return <StoreContext.Provider value={store}>
    <div className={`app${state.textScale >= 1.5 ? ' large' : ''}`} style={{ fontSize: `${state.textScale}rem` }}>
      <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main').focus(); }}>Skip to content</a>
      <header className="header">
        <div className="brand">
          {!primary && <button className="secondary back" onClick={() => navigate(key === 'default' ? '/' : -1)}>Back</button>}
          <span aria-hidden="true" className="brand-mark">✚</span><span>MediTrack</span>
        </div>
        <HeaderClock now={store.now} onDayChange={setDay} />
      </header>
      <div className={`app-shell${primary ? '' : ' detail-shell'}`}>
        {primary && <nav className="navigation" aria-label="Main navigation">
          {[[ '/', 'Today', '◷' ], ['/medicines', 'Medicines', '✚'], ['/history', 'History', '↺'], ['/more', 'More', '•••']].map(([path, label, icon]) =>
            <NavLink key={path} to={path} end><span aria-hidden="true">{icon}</span>{label}</NavLink>)}
          <p>Your routine,<br />at your pace.</p>
        </nav>}
        <div className="content">
          {state.error && <div className="error-summary storage-error" role="alert">
            <p>{state.error}</p>
            {!store.loadFailed && <button className="secondary" onClick={() => store.save(store.data())}>Retry save</button>}
          </div>}
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/medicines/new/*" element={<MedicineFlow key="new" />} />
            <Route path="/medicines/:id" element={<MedicineDetails />} />
            <Route path="/medicines/:id/edit/*" element={<MedicineFlow key={pathname.split('/')[2]} />} />
            <Route path="/dose/:id/:time" element={<Dose />} />
            <Route path="/history" element={<History />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/more" element={<Settings />} />
            <Route path="*" element={<Page title="Page not found" subtitle="Choose a destination to continue."><Link to="/">Go to Today</Link></Page>} />
          </Routes>
        </div>
      </div>
      <footer>Prototype · Use sample information only · Saved on this device</footer>
    </div>
  </StoreContext.Provider>;
}

export default function App({ store }) {
  return <HashRouter><Shell store={store} /></HashRouter>;
}
