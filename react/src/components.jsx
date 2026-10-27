import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { localDay } from './model';

export const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export function Page({ title, subtitle, children }) {
  const heading = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${title} · MediTrack`;
    heading.current.focus();
  }, [title, pathname]);
  return <main id="main" className="page" tabIndex={-1}>
    <h1 ref={heading} tabIndex={-1}>{title}</h1>
    <p className="subtitle">{subtitle}</p>
    {children}
  </main>;
}

export function Card({ children, emphasis = false, label }) {
  return <section className={`card${emphasis ? ' emphasis' : ''}`} aria-label={label}>{children}</section>;
}

export function MedicineHeading({ medicine }) {
  return <>
    <span className="medicine-icon" aria-hidden="true">
      <svg focusable="false" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 4a5 5 0 0 1 7 0l5 5a5 5 0 0 1-7 7l-5-5a5 5 0 0 1 0-7ZM10 6l8 8" />
      </svg>
    </span>
    <h2>{medicine.name}</h2><p className="muted">{medicine.strength}</p>
  </>;
}

export function ButtonLink({ to, children, secondary = false }) {
  return <Link className={`button${secondary ? ' secondary' : ''}`} to={to}>{children}</Link>;
}

export function Status({ value }) {
  return <p className={`badge ${value.toLowerCase()}`} role="status">Status: {value}</p>;
}

export function DoseControls({ doseKey }) {
  const store = useStore();
  const [previous, setPrevious] = useState(null);
  const takenButton = useRef(null);
  function record(status) {
    setPrevious(store.status(doseKey));
    store.record(doseKey, status);
  }
  return <div className="actions">
    <button ref={takenButton} onClick={() => record('Taken')}>Mark Taken</button>
    <button className="secondary" onClick={() => record('Skipped')}>Skip dose</button>
    {previous !== null && <button className="secondary" onClick={() => {
      store.record(doseKey, previous);
      setPrevious(null);
      takenButton.current.focus();
    }}>Undo last change</button>}
  </div>;
}

const systemNow = () => new Date();
export function HeaderClock({ now = systemNow, onDayChange, locale, hour12 }) {
  const [paused, setPaused] = useState(false);
  const [time, setTime] = useState(() => now());
  useEffect(() => {
    function refresh() {
      const current = now();
      if (!paused) setTime(previous => Math.floor(previous.getTime() / 60000) === Math.floor(current.getTime() / 60000) ? previous : current);
      onDayChange?.(localDay(current));
    }
    const timer = setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [now, onDayChange, paused]);
  const formatted = time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12 });
  return <div className="clock">
    <time dateTime={time.toISOString()} aria-label={`${paused ? "Paused time" : "Current time"}: ${formatted}`}>{formatted}</time>
    <button className="secondary" aria-pressed={paused} onClick={() => setPaused(value => !value)}>Pause clock updates</button>
  </div>;
}

export function ErrorSummary({ errors }) {
  const ref = useRef(null);
  useEffect(() => { if (Object.keys(errors).length) ref.current.focus(); }, [errors]);
  if (!Object.keys(errors).length) return null;
  return <div className="error-summary" role="alert" tabIndex={-1} ref={ref}>
    <h2>Check these details</h2>
    <ul>{Object.entries(errors).map(([key, message]) => <li key={key}>
      <a href={`#${key}`} onClick={event => { event.preventDefault(); document.getElementById(key).focus(); }}>{message}</a>
    </li>)}</ul>
  </div>;
}

export function Field({ name, label, error, ...props }) {
  return <div className="field">
    <label htmlFor={name}>{label}</label>
    <input id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...props} />
    {error && <p className="field-error" id={`${name}-error`}>{error}</p>}
  </div>;
}
