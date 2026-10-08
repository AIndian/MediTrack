import 'package:shared_preferences/shared_preferences.dart';
import 'package:meditrack/models/medicine.dart';
import 'package:meditrack/state/app_store.dart';

const med = Medicine(
  id: '1',
  name: 'Sample medicine',
  strength: '5 mg',
  instructions: 'Sample instructions',
  times: ['08:00', '18:00'],
  supply: 8,
);
Future<AppStore> fresh() async {
  SharedPreferences.setMockInitialValues({});
  return AppStore(
    await SharedPreferences.getInstance(),
    clock: () => DateTime(2026, 10, 8, 12),
  );
}
