import { useEffect, useRef } from 'react';

export function Dialog({ title, children, onClose }) {
  const dialog = useRef(null);
  const heading = useRef(null);
  useEffect(() => {
    const opener = document.activeElement;
    const node = dialog.current;
    node.showModal();
    heading.current.focus();
    return () => {
      node.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="desktop-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = [
          ...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], select, textarea'),
        ].filter((el) => el.getClientRects().length);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <h2 id="desktop-dialog-title" tabIndex={-1} ref={heading}>
        {title}
      </h2>
      {children}
    </dialog>
  );
}
