import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../react/src/StoreContext';
import { StorageNotice } from '../../react/src/components/StorageNotice';
import { HeaderClock, useCurrentTime } from '../../react/src/components/HeaderClock';
import { Page } from '../../react/src/components/Page';
import { Today } from '../../react/src/screens/Today';
import { MedicineDetails } from '../../react/src/screens/Medicines';
import { MedicineForm, MedicineReview } from '../../react/src/screens/MedicineFlow';
import { Dose, History } from '../../react/src/screens/Doses';
import { Symptoms, Summary, Settings } from '../../react/src/screens/More';
import { Dialog } from './Dialog';
import { DesktopMedicines } from './DesktopMedicines';

const destinations = [
  ['today', 'Today', '/'],
  ['medicines', 'Medicines', '/medicines'],
  ['history', 'History', '/history'],
  ['symptom', 'Symptoms', '/symptoms'],
  ['summary', 'Appointment summary', '/summary'],
  ['settings', 'Settings', '/settings'],
];
const shortcuts = [
  ['Ctrl+N', 'Add medicine'],
  ['Ctrl+Shift+L', 'Log symptom'],
  ['Ctrl+F', 'Find medicine'],
  ['Ctrl+S', 'Review / save form'],
  ['Ctrl+1–6', 'Go to a destination'],
  ['F1', 'Keyboard shortcuts'],
  ['Alt / F10', 'Native menu bar'],
  ['Tab / Shift+Tab', 'Next / previous control'],
  ['Escape', 'Close a dialog'],
  ['Ctrl++ / Ctrl+- / Ctrl+0', 'Window zoom'],
];

export default function DesktopApp() {
  const { store, textScale, error, readOnly } = useStore();
  const date = useCurrentTime(store.now);
  const location = useLocation();
  const navigate = useNavigate();
  const dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [help, setHelp] = useState(false);
  const setDraftDirty = useCallback(
    (value) => {
      dirtyRef.current = value;
      setDirty(value);
      window.mediTrackDesktop?.setDirty(value || Boolean(store.getSnapshot().error));
    },
    [store],
  );
  useEffect(() => {
    let previous = store.getSnapshot();
    return store.subscribe(() => {
      const next = store.getSnapshot();
      // Submitted records live in the store; a failed write still keeps the native close warning active.
      if (next.medicines !== previous.medicines || next.symptoms !== previous.symptoms) setDraftDirty(false);
      window.mediTrackDesktop?.setDirty(dirtyRef.current || Boolean(next.error));
      previous = next;
    });
  }, [store, setDraftDirty]);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!dirtyRef.current) return false;
    const from = currentLocation.pathname,
      to = nextLocation.pathname;
    const form = (path) => path === '/medicines/new' || /^\/medicines\/[^/]+\/edit$/.test(path);
    return !(
      (form(from) && to === '/medicines/review') ||
      (from === '/medicines/review' && to === (location.state?.formPath || '/medicines/new')) ||
      (from === to && !nextLocation.state?.focusSearch)
    );
  });
  useEffect(() => {
    const beforeUnload = (event) => {
      if (!window.mediTrackDesktop && (dirtyRef.current || store.getSnapshot().error)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [store]);
  const command = useCallback(
    (name) => {
      if (document.querySelector('dialog[open]')) return;
      if (name === 'help') {
        setHelp(true);
        return;
      }
      if (name === 'save') {
        if (readOnly) return;
        const form = document.querySelector('main form');
        if (form) form.requestSubmit();
        else if (location.pathname === '/medicines/review') document.querySelector('main > button')?.click();
        return;
      }
      if (name === 'find') {
        navigate('/medicines', { state: { focusSearch: true } });
        return;
      }
      const target = name === 'new' ? '/medicines/new' : destinations.find(([id]) => id === name)?.[2];
      if (target) navigate(target);
    },
    [location.pathname, navigate, readOnly],
  );
  useEffect(() => window.mediTrackDesktop?.onCommand(command), [command]);
  useEffect(() => {
    const keydown = (event) => {
      if (event.isComposing || event.repeat || event.getModifierState('AltGraph')) return;
      const key = event.key.toLowerCase();
      // Native menu accelerators consume OS key events; this also supports renderer keyboard input.
      let name = event.key === 'F1' ? 'help' : null;
      if ((event.ctrlKey || event.metaKey) && !event.altKey)
        name =
          (window.mediTrackDesktop && key === 'n' && !event.shiftKey) || (event.shiftKey && key === 'm')
            ? 'new'
            : event.shiftKey && key === 'l'
              ? 'symptom'
              : key === 'f'
                ? 'find'
                : key === 's'
                  ? 'save'
                  : name;
      if (name) {
        event.preventDefault();
        command(name);
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [command]);
  const formActive =
    !readOnly &&
    (location.pathname === '/symptoms' || /^\/medicines\/(new|review|[^/]+\/edit)$/.test(location.pathname));
  return (
    <div
      className="app desktop-app"
      style={{ '--text-scale': textScale }}
      data-large={textScale >= 1.75}
      onChange={(event) => {
        if (event.target.closest('main form')) setDraftDirty(true);
      }}
    >
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
          <img src="./favicon.png" alt="" width="32" height="32" />
          <span>
            MediTrack <small>Desktop</small>
          </span>
        </Link>
        <HeaderClock date={date} />
        <button id="desktop-help" className="secondary" onClick={() => command('help')}>
          Keyboard shortcuts <kbd>F1</kbd>
        </button>
      </header>
      <div className="desktop-toolbar" role="group" aria-label="Desktop actions">
        <button id="desktop-new" onClick={() => command('new')}>
          Add medicine
        </button>
        <button id="desktop-symptom" className="secondary" onClick={() => command('symptom')}>
          Log symptom
        </button>
        <button id="desktop-save" className="secondary" disabled={!formActive} onClick={() => command('save')}>
          Review / save
        </button>
        <button id="desktop-summary" className="secondary" onClick={() => command('summary')}>
          Appointment summary
        </button>
        <span className="draft-status" role="status">
          {dirty ? 'Unsaved draft' : error ? 'Saving needs attention' : 'Local records'}
        </span>
      </div>
      <StorageNotice />
      <div className="app-layout">
        <nav className="primary-nav" aria-label="Main navigation">
          {destinations.map(([id, label, to]) => (
            <NavLink id={`nav-${id}`} key={id} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
          <p>
            Your routine,
            <br />
            at your pace.
          </p>
        </nav>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/medicines" element={<DesktopMedicines />} />
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
                <Link to="/">Go to Today</Link>
              </Page>
            }
          />
        </Routes>
      </div>
      <footer>Prototype · Use sample information · Local storage is not encrypted · Reminders and sync are off</footer>
      {help && (
        <Dialog title="Keyboard shortcuts" onClose={() => setHelp(false)}>
          <p>
            All actions also have visible controls. On macOS, use Command in place of Ctrl. The browser preview uses
            Ctrl+Shift+M for Add medicine.
          </p>
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map(([keys, label]) => (
                <tr key={keys}>
                  <td>
                    <kbd>{keys}</kbd>
                  </td>
                  <td>{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setHelp(false)}>Close</button>
        </Dialog>
      )}
      {blocker.state === 'blocked' && (
        <Dialog title="Leave this draft?" onClose={() => blocker.reset()}>
          <p>Your unsaved form details will be lost if you leave.</p>
          <div className="actions">
            <button onClick={() => blocker.reset()}>Keep working</button>
            <button
              className="secondary"
              onClick={() => {
                setDraftDirty(false);
                blocker.proceed();
              }}
            >
              Discard draft
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
