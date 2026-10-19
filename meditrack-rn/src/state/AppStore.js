// Port of lib/state/app_store.dart
import { createMedicine, medicineFromJson, medicineToJson } from '../models/medicine';

export const STORAGE_KEY = 'meditrack.v1';
export const TEXT_SCALES = [1.0, 1.25, 1.5, 1.75, 2.0];
const STATUSES = ['Due', 'Taken', 'Skipped'];

// Local-time YYYY-MM-DD (toISOString would use UTC and shift the day)
export function localDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class AppStore {
  constructor(storage, { clock } = {}) {
    this.storage = storage;
    this.now = clock ?? (() => new Date());
    this.medicines = [];
    this.doses = {};
    this.symptoms = [];
    this.textScale = 1.0;
    this.error = null;
    this.pending = Promise.resolve();
    this.version = 0;
    this.listeners = new Set();
    this.subscribe = this.subscribe.bind(this);
  }

  // Storage is async in React Native, so loading happens in a factory
  static async load(storage, options) {
    const store = new AppStore(storage, options);
    try {
      const raw = await storage.getItem(STORAGE_KEY);
      if (raw != null) {
        const j = JSON.parse(raw);
        store.medicines = j.medicines.map(medicineFromJson);
        store.doses = { ...j.doses };
        store.symptoms = [...j.symptoms];
        const saved = j.textScale ?? (j.largeText === true ? 2.0 : 1.0);
        if (typeof saved === 'number' && TEXT_SCALES.includes(saved)) {
          store.textScale = saved;
        }
      }
    } catch {
      store.error = 'Could not load data. Restart the app.';
    }
    return store;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }

  get largeText() {
    return this.textScale > 1.0;
  }

  get day() {
    return localDate(this.now());
  }

  get active() {
    return this.medicines.filter((m) => !m.archived);
  }

  doseKey(medicine, time) {
    return `${this.day}|${medicine.id}|${time}`;
  }

  status(key) {
    return this.doses[key] ?? 'Due';
  }

  save() {
    if (this.error) {
      this.notify();
      return;
    }
    const encoded = JSON.stringify({
      medicines: this.medicines.map(medicineToJson),
      doses: this.doses,
      symptoms: this.symptoms,
      largeText: this.largeText,
      textScale: this.textScale,
    });
    this.pending = this.pending.then(async () => {
      try {
        await this.storage.setItem(STORAGE_KEY, encoded);
      } catch {
        this.error = 'Could not save. Keep the app open.';
        this.notify();
      }
    });
    this.notify();
  }

  put(medicine) {
    const i = this.medicines.findIndex((m) => m.id === medicine.id);
    if (i < 0) {
      this.medicines = [...this.medicines, medicine];
    } else {
      this.medicines = this.medicines.map((m, idx) => (idx === i ? medicine : m));
    }
    this.save();
  }

  archive(m) {
    this.put(createMedicine({ ...m, archived: !m.archived }));
  }

  record(key, value) {
    if (!STATUSES.includes(value)) {
      throw new Error(`Invalid dose status: ${value}`);
    }
    const next = { ...this.doses };
    if (value === 'Due') {
      delete next[key];
    } else {
      next[key] = value;
    }
    this.doses = next;
    this.save();
  }

  symptom(name, severity, notes) {
    if (!name || name.trim() === '') {
      throw new Error('Symptom is required');
    }
    this.symptoms = [
      {
        name: name.trim(),
        severity,
        notes: (notes ?? '').trim(),
        date: this.now().toISOString(),
      },
      ...this.symptoms,
    ];
    this.save();
  }

  setLargeText(value) {
    this.setTextScale(value ? 2.0 : 1.0);
  }

  setTextScale(value) {
    if (!TEXT_SCALES.includes(value)) {
      throw new Error('Choose 100% to 200% in 25% steps');
    }
    this.textScale = value;
    this.save();
  }

  history(days) {
    const n = this.now();
    const cutoff = localDate(new Date(n.getFullYear(), n.getMonth(), n.getDate() - (days - 1)));
    return Object.entries(this.doses)
      .filter(([key]) => key.split('|')[0] >= cutoff)
      .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0));
  }

  doseLabel(key) {
    const [date, id, time] = key.split('|');
    const match = this.medicines.find((m) => m.id === id);
    return `${match ? match.name : 'Removed medicine'} • ${date} • ${time}`;
  }
}