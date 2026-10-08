class Medicine {
  final String id, name, strength, instructions;
  final List<String> times;
  final int supply;
  final bool archived;
  const Medicine({
    required this.id,
    required this.name,
    required this.strength,
    required this.instructions,
    required this.times,
    this.supply = 30,
    this.archived = false,
  });
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'strength': strength,
    'instructions': instructions,
    'times': times,
    'supply': supply,
    'archived': archived,
  };
  factory Medicine.fromJson(Map<String, dynamic> j) => Medicine(
    id: j['id'],
    name: j['name'],
    strength: j['strength'],
    instructions: j['instructions'],
    times: List<String>.from(j['times']),
    supply: j['supply'],
    archived: j['archived'],
  );
}
