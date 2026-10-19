export const textScales = [1, 1.25, 1.5, 1.75, 2];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function localDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validateMedicine(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = 'Enter a medicine name';
  if (!fields.strength.trim()) errors.strength = 'Enter a strength / dosage';
  if (fields.times.split(',').some(time => !timePattern.test(time.trim()))) {
    errors.times = 'Use times such as 08:00, 18:00';
  }
  if (!/^\d+$/.test(fields.supply.trim()) || !Number.isSafeInteger(Number(fields.supply))) {
    errors.supply = 'Enter a whole number, zero or more';
  }
  return errors;
}

export function medicineFromFields(fields, id, archived = false) {
  if (Object.keys(validateMedicine(fields)).length) throw new Error('Check the medicine fields');
  return {
    id, archived, name: fields.name.trim(), strength: fields.strength.trim(),
    instructions: fields.instructions.trim(),
    times: [...new Set(fields.times.split(',').map(time => time.trim()))].sort(),
    supply: Number(fields.supply),
  };
}

export function isMedicine(medicine) {
  return medicine && typeof medicine.id === 'string' && medicine.id.length > 0 && !medicine.id.includes('|') &&
    ['name', 'strength', 'instructions'].every(key => typeof medicine[key] === 'string') &&
    medicine.name.trim().length > 0 && medicine.strength.trim().length > 0 &&
    Array.isArray(medicine.times) && medicine.times.length > 0 &&
    medicine.times.every(time => typeof time === 'string' && timePattern.test(time)) &&
    new Set(medicine.times).size === medicine.times.length &&
    Number.isSafeInteger(medicine.supply) && medicine.supply >= 0 && typeof medicine.archived === 'boolean';
}

export function isDoseKey(key) {
  const [day, id, time, extra] = key.split('|');
  const date = new Date(`${day}T12:00:00`);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(date.getTime()) &&
    localDay(date) === day && Boolean(id) && timePattern.test(time) && extra === undefined;
}

export function cutoffDay(now, days) {
  const date = new Date(now);
  date.setDate(date.getDate() - days + 1);
  return localDay(date);
}
