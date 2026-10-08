import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';
import 'medicine_form_screen.dart';

class Details extends StatelessWidget {
  final AppStore store;
  final String id;
  const Details({super.key, required this.store, required this.id});
  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: store,
    builder: (context, _) {
      final m = store.medicines.firstWhere((m) => m.id == id);
      return AppPage('Medicine details', [
        panel([
          medicineHeading(m),
          const SizedBox(height: 16),
          const Text('Instructions you entered'),
          Text(m.instructions.isEmpty ? 'None entered' : m.instructions),
          const SizedBox(height: 16),
          heading('Schedule'),
          Text('Daily at ${m.times.join(', ')}'),
          Text(m.archived ? 'Archived — no longer scheduled' : 'Active'),
        ]),
        panel([
          heading('Refill details'),
          Text('Recorded supply: ${m.supply} doses'),
          const Text('Low-supply threshold: 10 doses'),
        ]),
        action(
          'Edit medicine',
          () => open(context, MedicineForm(store: store, medicine: m)),
        ),
        action(
          m.archived ? 'Restore medicine' : 'Archive medicine',
          () => store.archive(m),
        ),
      ]);
    },
  );
}
