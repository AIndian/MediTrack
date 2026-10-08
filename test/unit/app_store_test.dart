import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:meditrack/state/app_store.dart';

import '../support/fixtures.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('Records persist, replace, archive, undo and filter by date', () async {
    final s = await fresh();
    expect(s.active, isEmpty);
    s.put(med);
    s.put(med);
    expect(s.medicines.length, 1);
    s.archive(med);
    expect(s.active, isEmpty);
    s.archive(s.medicines.single);
    final key = s.doseKey(med, '08:00');
    s.record(key, 'Taken');
    expect(s.status(key), 'Taken');
    s.record(key, 'Skipped');
    s.record('2026-08-01|1|08:00', 'Taken');
    expect(s.history(7).length, 1);
    expect(s.doseLabel(key), contains('Sample medicine'));
    expect(
      s.doseLabel('2026-10-08|unknown|08:00'),
      contains('Removed medicine'),
    );
    s.symptom(' Headache ', 'Mild', ' Notes ');
    s.setLargeText(true);
    await s.pending;
    final restored = AppStore(s.prefs);
    expect(restored.medicines.single.name, med.name);
    expect(restored.symptoms.single['name'], 'Headache');
    expect(restored.largeText, true);
    expect(restored.status(key), 'Skipped');
    s.record(key, 'Due');
    expect(s.status(key), 'Due');
    expect(() => s.record(key, 'Invalid'), throwsArgumentError);
    expect(() => s.symptom(' ', 'Mild', ''), throwsArgumentError);
    await s.pending;
  });
  test('Corrupt saved data surfaces an error without overwriting it', () async {
    SharedPreferences.setMockInitialValues({'meditrack.v1': '{bad'});
    final s = AppStore(await SharedPreferences.getInstance());
    expect(s.error, isNotNull);
    s.save();
    expect(s.prefs.getString('meditrack.v1'), '{bad');
  });
}
