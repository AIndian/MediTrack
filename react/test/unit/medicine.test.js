import { expect, it } from 'vitest';
import { isDoseKey, isMedicine, medicineFromFields, validateMedicine } from '../../src/model';
import { med } from '../support/fixtures';

const fields = { ...med, name: ' Sample medicine ', times: '18:00, 08:00, 08:00', supply: '8' };
it('trims, deduplicates and sorts daily times without changing prescription details', () => {
  expect(medicineFromFields(fields, '1')).toEqual(med);
  expect(medicineFromFields(fields, '1', true).archived).toBe(true);
  expect(isMedicine(med)).toBe(true);
});

it('validates required fields, 24-hour times and nonnegative safe whole supply', () => {
  expect(validateMedicine({ ...fields, name: ' ', strength: '', times: '25:00', supply: '-1' })).toEqual({
    name: 'Enter a medicine name', strength: 'Enter a strength / dosage',
    times: 'Use times such as 08:00, 18:00', supply: 'Enter a whole number, zero or more',
  });
  for (const supply of ['', '1.5', 'Infinity', '9007199254740992']) {
    expect(validateMedicine({ ...fields, supply })).toHaveProperty('supply');
  }
  expect(validateMedicine({ ...fields, supply: '0', times: '00:00, 23:59' })).toEqual({});
  expect(() => medicineFromFields({ ...fields, times: '8:00' }, '1')).toThrow();
  expect(isMedicine({ ...med, times: [] })).toBe(false);
  expect(isMedicine({ ...med, times: ['08:00', '08:00'] })).toBe(false);
  expect(isDoseKey('2026-10-08|1|08:00')).toBe(true);
  for (const key of ['bad', '2026-02-30|1|08:00', '2026-10-08||08:00', '2026-10-08|1|08:00|extra']) {
    expect(isDoseKey(key)).toBe(false);
  }
});
