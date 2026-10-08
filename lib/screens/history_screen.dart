import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';

class History extends StatelessWidget {
  final AppStore store;
  const History({super.key, required this.store});
  @override
  Widget build(BuildContext context) => AppPage('Dose history', [
    const Text('Last 30 days • Select a status to correct an entry.'),
    if (store.history(30).isEmpty) const Text('No doses recorded yet.'),
    for (final entry in store.history(30))
      panel([
        Text(store.doseLabel(entry.key)),
        Text('Status: ${entry.value}'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final status in ['Taken', 'Skipped', 'Due'])
              OutlinedButton(
                onPressed: () => store.record(entry.key, status),
                child: Text(status),
              ),
          ],
        ),
      ]),
  ]);
}
