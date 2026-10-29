import { useEffect, useState } from 'react';

export function useCurrentTime(now) {
  const [date, setDate] = useState(now);
  useEffect(() => {
    const refresh = () => {
      const next = now();
      setDate((previous) => (Math.floor(+previous / 60000) === Math.floor(+next / 60000) ? previous : next));
    };
    const timer = setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [now]);
  return date;
}

export function HeaderClock({ date }) {
  const [pausedDate, setPausedDate] = useState(null);
  const displayedDate = pausedDate ?? date;
  const time = displayedDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return (
    <div className="header-clock">
      <time
        dateTime={displayedDate.toISOString()}
        aria-label={`${pausedDate ? 'Paused time' : 'Current time'}: ${time}`}
      >
        {time}
      </time>
      <button
        className="secondary"
        aria-pressed={Boolean(pausedDate)}
        onClick={() => setPausedDate((previous) => (previous ? null : date))}
      >
        Pause clock updates
      </button>
    </div>
  );
}
