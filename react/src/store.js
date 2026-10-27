export const storageKey = 'meditrack.react.v1';
export const textScales = [1, 1.25, 1.5, 1.75, 2];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const severities = ['Mild', 'Moderate', 'Severe'];
const emptyState = () => ({ medicines: [], doses: {}, symptoms: [], textScale: 1, error: null, readOnly: false });

function validateTimes(times) {
  if (!Array.isArray(times) || times.length === 0 ||
      times.some((time) => typeof time !== 'string' || !timePattern.test(time))) {
    return 'Use times such as 08:00, 18:00';
  }
  if (new Set(times).size !== times.length) return 'Enter each daily time only once';
}

function validSupply(supply) {
  return Number.isSafeInteger(supply) && supply >= 0;
}

export function localDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function createMedicineId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function validateMedicine(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = 'Please enter a medicine name';
  if (!fields.strength.trim()) errors.strength = 'Please enter a strength / dosage';
  const timeError = validateTimes(fields.times.split(',').map((time) => time.trim()));
  if (timeError) errors.times = timeError;
  const supply = String(fields.supply).trim();
  if (!/^\d+$/.test(supply) || !validSupply(Number(supply))) {
    errors.supply = 'Enter a whole number, zero or more';
  }
  return errors;
}

function validMedicine(m) {
  return m && typeof m.id === 'string' && m.id.length > 0 && !m.id.includes('|') &&
    ['name', 'strength', 'instructions'].every((key) => typeof m[key] === 'string') &&
    m.name.trim() && m.strength.trim() && !validateTimes(m.times) &&
    validSupply(m.supply) && typeof m.archived === 'boolean';
}

function validDoseKey(key) {
  const [day, id, time, extra] = key.split('|');
  const date = new Date(`${day}T12:00:00`);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(+date) &&
    localDay(date) === day && Boolean(id) && timePattern.test(time) && extra === undefined;
}

function validSymptom(s) {
  return s && typeof s.name === 'string' && s.name.trim() && severities.includes(s.severity) &&
    typeof s.notes === 'string' && typeof s.date === 'string' && !Number.isNaN(Date.parse(s.date));
}

function decode(raw) {
  const data = JSON.parse(raw);
  if (!data || !Array.isArray(data.medicines) || !data.medicines.every(validMedicine) ||
      new Set(data.medicines.map((m) => m.id)).size !== data.medicines.length ||
      !data.doses || typeof data.doses !== 'object' || Array.isArray(data.doses) ||
      !Object.entries(data.doses).every(([key, status]) => validDoseKey(key) && ['Taken', 'Skipped'].includes(status)) ||
      !Array.isArray(data.symptoms) || !data.symptoms.every(validSymptom)) {
    throw new Error('Invalid saved records');
  }
  const scale = data.textScale ?? (data.largeText === true ? 2 : 1);
  return {
    medicines: data.medicines,
    doses: data.doses,
    symptoms: data.symptoms,
    textScale: textScales.includes(scale) ? scale : 1,
  };
}

export class AppStore {
  constructor({ storage, clock = () => new Date() } = {}) {
    this.now = clock;
    this.listeners = new Set();
    this.state = emptyState();
    this.rawData = null;
    try {
      this.storage = storage ?? window.localStorage;
      this.rawData = this.storage.getItem(storageKey);
      if (this.rawData !== null) this.state = { ...this.state, ...decode(this.rawData) };
    } catch {
      this.state = { ...this.state, error: 'Could not load data. Your saved data has not been changed. Download a backup before resetting.', readOnly: true };
    }
  }

  getSnapshot = () => this.state;
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  save(changes = {}) {
    if (this.state.readOnly) throw new Error('Cannot edit unreadable saved data. Download a backup and reset first.');
    this.state = { ...this.state, ...changes, error: null };
    const { medicines, doses, symptoms, textScale } = this.state;
    try {
      this.storage.setItem(storageKey, JSON.stringify({ medicines, doses, symptoms, textScale }));
    } catch {
      this.state = { ...this.state, error: 'Could not save. Keep this tab open and retry saving.' };
    }
    this.listeners.forEach((listener) => listener());
    return this.state.error === null;
  }

  reset(confirmed = false) {
    if (confirmed !== true || !this.state.readOnly || this.rawData === null) return false;
    try {
      if (this.storage.getItem(storageKey) !== this.rawData) throw new Error('Changed since loading');
      this.storage.removeItem(storageKey);
      this.rawData = null;
      this.state = emptyState();
    } catch {
      this.state = { ...this.state, error: 'Could not reset saved data. Nothing was deleted. Reload the app and check browser storage access before trying again.' };
    }
    this.listeners.forEach((listener) => listener());
    return !this.state.readOnly;
  }

  get day() { return localDay(this.now()); }
  get active() { return this.state.medicines.filter((m) => !m.archived); }
  doseKey(medicine, time) { return `${this.day}|${medicine.id}|${time}`; }
  status(key) { return this.state.doses[key] ?? 'Due'; }

  put(medicine) {
    if (!validMedicine(medicine)) throw new Error('Invalid medicine');
    const medicines = this.state.medicines.filter((m) => m.id !== medicine.id);
    const index = this.state.medicines.findIndex((m) => m.id === medicine.id);
    medicines.splice(index < 0 ? medicines.length : index, 0, medicine);
    return this.save({ medicines });
  }

  archive(medicine) { return this.put({ ...medicine, archived: !medicine.archived }); }

  record(key, value) {
    if (!validDoseKey(key) || !['Due', 'Taken', 'Skipped'].includes(value)) throw new Error('Invalid dose record');
    const doses = { ...this.state.doses };
    if (value === 'Due') delete doses[key];
    else doses[key] = value;
    return this.save({ doses });
  }

  symptom(name, severity, notes) {
    const symptom = { name: name.trim(), severity, notes: notes.trim(), date: this.now().toISOString() };
    if (!validSymptom(symptom)) throw new Error('Enter a symptom and valid severity');
    return this.save({ symptoms: [symptom, ...this.state.symptoms] });
  }

  setLargeText(value) { return this.setTextScale(value ? 2 : 1); }
  setTextScale(value) {
    if (!textScales.includes(value)) throw new Error('Choose 100% to 200% in 25% steps');
    return this.save({ textScale: value });
  }

  inRange(date, days) {
    const cutoff = new Date(`${this.day}T00:00:00`);
    cutoff.setDate(cutoff.getDate() - days + 1);
    const end = new Date(`${this.day}T00:00:00`);
    end.setDate(end.getDate() + 1);
    return new Date(date) >= cutoff && new Date(date) < end;
  }

  history(days) {
    const day = this.day;
    const cutoff = new Date(`${day}T00:00:00`);
    cutoff.setDate(cutoff.getDate() - days + 1);
    const firstDay = localDay(cutoff);
    const names = new Map(this.state.medicines.map((medicine) => [medicine.id, medicine.name]));
    const compareNames = new Intl.Collator(undefined, { sensitivity: 'base' }).compare;
    return Object.entries(this.state.doses)
      .filter(([key]) => {
        const date = key.slice(0, 10);
        return date >= firstDay && date <= day;
      })
      .sort(([a], [b]) => {
        const [dayA, idA, timeA] = a.split('|');
        const [dayB, idB, timeB] = b.split('|');
        return dayB.localeCompare(dayA) || timeA.localeCompare(timeB) ||
          compareNames(names.get(idA) ?? 'Removed medicine', names.get(idB) ?? 'Removed medicine') ||
          idA.localeCompare(idB);
      });
  }

  doseLabel(key) {
    const [day, id, time] = key.split('|');
    const medicine = this.state.medicines.find((m) => m.id === id);
    return `${medicine?.name ?? 'Removed medicine'} • ${day} • ${time}`;
  }
}
