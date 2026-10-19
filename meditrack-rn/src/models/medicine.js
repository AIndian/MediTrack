// Port of lib/models/medicine.dart
const REQUIRED = ['id', 'name', 'strength', 'instructions', 'times'];

export function createMedicine({
  id,
  name,
  strength,
  instructions,
  times,
  supply = 30,
  archived = false,
}) {
  const given = { id, name, strength, instructions, times };
  for (const field of REQUIRED) {
    if (given[field] === undefined || given[field] === null) {
      throw new Error(`Medicine is missing required field: ${field}`);
    }
  }
  return Object.freeze({
    id,
    name,
    strength,
    instructions,
    times: [...times],
    supply,
    archived,
  });
}

export function medicineToJson(m) {
  return {
    id: m.id,
    name: m.name,
    strength: m.strength,
    instructions: m.instructions,
    times: [...m.times],
    supply: m.supply,
    archived: m.archived,
  };
}

export function medicineFromJson(j) {
  return createMedicine({
    id: j.id,
    name: j.name,
    strength: j.strength,
    instructions: j.instructions,
    times: j.times,
    supply: j.supply,
    archived: j.archived,
  });
}