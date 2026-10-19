import { createMedicine, medicineFromJson, medicineToJson } from '../src/models/medicine';

const base = {
  id: 'm1',
  name: 'Metformin',
  strength: '500 mg',
  instructions: 'Take with food',
  times: ['08:00', '20:00'],
};

test('applies default supply and archived values', () => {
  const m = createMedicine(base);
  expect(m.supply).toBe(30);
  expect(m.archived).toBe(false);
});

test('JSON round trip keeps every field', () => {
  const m = createMedicine({ ...base, supply: 12, archived: true });
  const back = medicineFromJson(JSON.parse(JSON.stringify(medicineToJson(m))));
  expect(back).toEqual(m);
});

test('throws when a required field is missing', () => {
  expect(() => createMedicine({ ...base, name: undefined })).toThrow('name');
});

test('copies the times array so outside changes do not leak in', () => {
  const times = ['08:00'];
  const m = createMedicine({ ...base, times });
  times.push('12:00');
  expect(m.times).toEqual(['08:00']);
});