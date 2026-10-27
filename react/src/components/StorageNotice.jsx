import { useEffect, useRef, useState } from 'react';
import { useStore } from '../StoreContext';

export function StorageNotice() {
  const { store, error, readOnly } = useStore();
  const [downloadError, setDownloadError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const status = useRef(null);
  useEffect(() => { if (!error && confirmation) status.current?.focus(); }, [error, confirmation]);
  if (!error) return confirmation && <p className="save-status" ref={status} tabIndex={-1} role="status">{confirmation.message}</p>;
  const canRecover = store.rawData !== null;

  function download() {
    try {
      const url = URL.createObjectURL(new Blob([store.rawData], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'meditrack-react-backup.json';
      document.body.append(link);
      try { link.click(); } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setDownloadError('');
    } catch {
      setDownloadError('Could not download the backup. Your saved data is unchanged. Try again before resetting.');
    }
  }

  return <section className="storage-error" aria-label="Saved data recovery">
    <p role="alert">{error}</p>
    {readOnly ? <>
      <p>Reset permanently deletes this app’s saved records. Download the original JSON first; the backup may contain invalid entries.</p>
      {!canRecover && <p>Browser storage could not be read. Restore access and reload before downloading or resetting.</p>}
      <div className="actions">
        <button disabled={!canRecover} onClick={download}>Download saved JSON</button>
        <button disabled={!canRecover} onClick={() => {
          if (window.confirm('Reset all MediTrack React data in this browser? This permanently deletes the saved records. Download a backup first.') && store.reset(true)) {
            document.getElementById('main')?.focus();
          }
        }}>Reset saved data</button>
      </div>
      {downloadError && <p role="alert">{downloadError}</p>}
    </> : <button onClick={() => {
      if (store.save()) setConfirmation({ message: 'Changes saved on this device.' });
    }}>Retry saving</button>}
  </section>;
}
