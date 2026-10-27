import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Page({ title, backTo, backState, children }) {
  const heading = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${title} · MediTrack`;
    heading.current.focus();
  }, [pathname, title]);
  return <main id="main" tabIndex={-1}>
    {backTo && <Link className="back-link" to={backTo} state={backState}>← Back</Link>}
    <h1 ref={heading} tabIndex={-1}>{title}</h1>
    {children}
  </main>;
}

export function MedicineHeading({ medicine }) {
  return <div className="medicine-heading">
    <span className="pill-icon" aria-hidden="true">✚</span>
    <div><h2>{medicine.name}</h2><p>{medicine.strength}</p></div>
  </div>;
}
