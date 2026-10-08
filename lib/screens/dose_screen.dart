import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../models/medicine.dart';
import '../widgets/design_widgets.dart';
import '../widgets/dose_controls.dart';
import 'medicine_details_screen.dart';

class Dose extends StatelessWidget {
  final AppStore store;
  final Medicine medicine;
  final String time;
  const Dose({
    super.key,
    required this.store,
    required this.medicine,
    required this.time,
  });
  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: store,
    builder: (context, _) => AppPage('Medication reminder', [
      panel([
        medicineHeading(medicine),
        badge(store.status(store.doseKey(medicine, time))),
        Text('${store.day} at $time'),
        Text(medicine.instructions),
        DoseControls(store: store, doseKey: store.doseKey(medicine, time)),
        TextButton(
          onPressed: () =>
              open(context, Details(store: store, id: medicine.id)),
          child: const Text('View medicine details'),
        ),
      ]),
      const Text('You can also correct this record later in History.'),
    ]),
  );
}
