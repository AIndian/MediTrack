import { cutoffDay, isDoseKey, isMedicine, localDay, textScales } from './model';

// Separate key: the React prototype never overwrites Flutter's saved records.
export const storageKey = 'meditrack.react.v1';
const emptyState = () => ({ medicines: [], doses: {}, symptoms: [], textScale: 1 });

function readState(raw) {
  const state = JSON.parse(raw);
  if (!Array.isArray(state.medicines) || !state.medicines.every(isMedicine) ||
      new Set(state.medicines.map(m => m.id)).size !== state.medicines.length ||
      !state.doses || typeof state.doses !== 'object' || Array.isArray(state.doses) ||
      !Object.entries(state.doses).every(([key, status]) => isDoseKey(key) && ['Taken', 'Skipped'].includes(status)) ||
      !Array.isArray(state.symptoms) || !state.symptoms.every(s => s &&
        typeof s.name === 'string' && s.name.trim() && ['Mild', 'Moderate', 'Severe'].includes(s.severity) &&
        typeof s.notes === 'string' && typeof s.date === 'string' && !Number.isNaN(Date.parse(s.date)))) {
    throw new Error('Invalid saved records');
  }
  const textScale = state.textScale ?? (state.largeText === true ? 2 : 1);
  if (!textScales.includes(textScale)) throw new Error('Invalid text size');
  return { medicines: state.medicines, doses: state.doses, symptoms: state.symptoms, textScale };
}

export class AppStore {
  constructor({ storage, now = () => new Date() } = {}) {
    this.now = now;
    this.listeners = new Set();
    this.state = { ...emptyState(), error: null };
    this.loadFailed = false;
    try {
      this.storage = storage ?? window.localStorage;
      const raw = this.storage.getItem(storageKey);
      if (raw !== null) this.state = { ...readState(raw), error: null };
    } catch {
      this.loadFailed = true;
      this.state.error = 'Could not load data. Saved data was not overwritten. Restart the app.';
    }
  }

  subscribe = listener => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = () => this.state;
  get day() { return localDay(this.now()); }
  get active() { return this.state.medicines.filter(m => !m.archived); }
  doseKey(medicine, time) { return `${this.day}|${medicine.id}|${time}`; }
  status(key) { return this.state.doses[key] ?? 'Due'; }

  save(next) {
    if (this.loadFailed) return false;
    let error = null;
    try {
      this.storage.setItem(storageKey, JSON.stringify(next));
    } catch {
      error = 'Could not save. Keep the app open and free device storage before trying again.';
    }
    this.state = { ...next, error };
    this.listeners.forEach(listener => listener());
    return !error;
  }

  put(medicine) {
    if (!isMedicine(medicine)) throw new Error('Invalid medicine');
    const medicines = this.state.medicines.filter(m => m.id !== medicine.id);
    const index = this.state.medicines.findIndex(m => m.id === medicine.id);
    medicines.splice(index < 0 ? medicines.length : index, 0, structuredClone(medicine));
    return this.save({ ...this.data(), medicines });
  }
  archive(medicine) { return this.put({ ...medicine, archived: !medicine.archived }); }
  record(key, value) {
    if (!isDoseKey(key) || !['Due', 'Taken', 'Skipped'].includes(value)) throw new Error('Invalid dose record');
    const doses = { ...this.state.doses };
    if (value === 'Due') delete doses[key];
    else doses[key] = value;
    return this.save({ ...this.data(), doses });
  }
  symptom(name, severity, notes) {
    if (!name.trim() || !['Mild', 'Moderate', 'Severe'].includes(severity)) throw new Error('Enter a symptom and severity');
    const symptom = { name: name.trim(), severity, notes: notes.trim(), date: this.now().toISOString() };
    return this.save({ ...this.data(), symptoms: [symptom, ...this.state.symptoms] });
  }
  setTextScale(textScale) {
    if (!textScales.includes(textScale)) throw new Error('Choose 100% to 200% in 25% steps');
    return this.save({ ...this.data(), textScale });
  }
  setLargeText(value) { return this.setTextScale(value ? 2 : 1); }
  history(days) {
    const cutoff = cutoffDay(this.now(), days);
    return Object.entries(this.state.doses)
      .filter(([key]) => key.slice(0, 10) >= cutoff && key.slice(0, 10) <= this.day)
      .sort(([a], [b]) => b.localeCompare(a));
  }
  doseLabel(key) {
    const [date, id, time] = key.split('|');
    const medicine = this.state.medicines.find(m => m.id === id);
    return `${medicine?.name ?? 'Removed medicine'} • ${date} • ${time}`;
  }
  data() {
    const { error, ...data } = this.state;
    return data;
  }
}
