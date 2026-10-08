import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';

class Summary extends StatefulWidget {
  final AppStore store;
  const Summary({super.key, required this.store});
  @override
  State<Summary> createState() => _SummaryState();
}

class _SummaryState extends State<Summary> {
  int days = 7;
  @override
  Widget build(BuildContext context) {
    final history = widget.store.history(days);
    final cutoff = DateTime.parse(widget.store.day)
        .subtract(Duration(days: days - 1));
    return AppPage('Appointment summary', [
      DropdownButtonFormField<int>(
        isExpanded: true,
        initialValue: days,
        decoration: const InputDecoration(labelText: 'Date range'),
        items: [7, 30]
            .map((n) => DropdownMenuItem(value: n, child: Text('Last $n days')))
            .toList(),
        onChanged: (v) => setState(() => days = v!),
      ),
      panel([
        heading('Recorded doses'),
        Text(
          '${history.where((e) => e.value == 'Taken').length} taken of ${history.length} recorded doses',
        ),
        const Text('Unrecorded doses are not included in this count.'),
      ]),
      heading('Current medicines'),
      for (final m in widget.store.active)
        Text(
          '${m.name} • ${m.strength} • ${m.times.join(', ')} • Supply: ${m.supply}',
        ),
      heading('Symptoms'),
      for (final s in widget.store.symptoms.where(
        (s) => !DateTime.parse(s['date']).isBefore(cutoff),
      ))
        Text('${s['name']} • ${s['severity']} • ${s['notes']}'),
      heading('Dose records'),
      for (final e in history)
        Text('${widget.store.doseLabel(e.key)} • ${e.value}'),
      const Text(
        'Allergies and medication changes are not tracked in this build. This summary stays on your device; export and sharing are unavailable.',
      ),
    ]);
  }
}
