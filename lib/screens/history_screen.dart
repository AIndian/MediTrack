import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';

class History extends StatefulWidget {
  final AppStore store;
  const History({super.key, required this.store});
  @override
  State<History> createState() => _HistoryState();
}

class _HistoryState extends State<History> {
  String message = '';
  AppStore get store => widget.store;
  @override
  Widget build(BuildContext context) => AppPage('Dose history', [
    Semantics(liveRegion: true, child: Text(message)),
    const Text('Last 30 days • Select a status to correct an entry.'),
    if (store.history(30).isEmpty) const Text('No doses recorded yet.'),
    for (final entry in store.history(30))
      panel([
        heading(store.doseLabel(entry.key)),
        badge(entry.value),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final status in ['Taken', 'Skipped', 'Due'])
              OutlinedButton(
                onPressed: () {
                  if (status == 'Due') FocusScope.of(context).previousFocus();
                  store.record(entry.key, status);
                  setState(() => message = '${store.doseLabel(entry.key)}: $status');
                },
                child: Text(status),
              ),
          ],
        ),
      ]),
  ]);
}
