import { useState } from 'react';
import { useStore } from '../StoreContext';

export function DoseControls({ doseKey }) {
  const { store, readOnly } = useStore();
  const [previous, setPrevious] = useState(null);
  const [message, setMessage] = useState('');
  function record(value) {
    setPrevious(store.status(doseKey));
    const saved = store.record(doseKey, value);
    setMessage(saved ? `${value} saved on this device.` : `${value} recorded in this tab. Saving has failed.`);
  }
  return (
    <div className="dose-controls">
      <p className={`badge ${store.status(doseKey).toLowerCase()}`}>Status: {store.status(doseKey)}</p>
      <button disabled={readOnly} onClick={() => record('Taken')}>
        Mark Taken
      </button>
      <button disabled={readOnly} className="secondary" onClick={() => record('Skipped')}>
        Skip dose
      </button>
      {previous !== null && (
        <button
          disabled={readOnly}
          className="secondary"
          onClick={() => {
            const saved = store.record(doseKey, previous);
            setMessage(saved ? 'Last change undone.' : 'Last change undone in this tab. Saving has failed.');
            setPrevious(null);
          }}
        >
          Undo last change
        </button>
      )}
      <p className="announcement" role="status">
        {message}
      </p>
    </div>
  );
}
