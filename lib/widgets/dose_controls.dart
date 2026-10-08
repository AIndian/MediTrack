import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';

class DoseControls extends StatefulWidget {
  final AppStore store;
  final String doseKey;
  const DoseControls({super.key, required this.store, required this.doseKey});
  @override
  State<DoseControls> createState() => _DoseControlsState();
}

class _DoseControlsState extends State<DoseControls> {
  String? previous;
  void record(String status) {
    setState(() => previous = widget.store.status(widget.doseKey));
    widget.store.record(widget.doseKey, status);
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      action('Mark Taken', () => record('Taken')),
      Padding(
        padding: const EdgeInsets.only(top: 12),
        child: OutlinedButton(
          onPressed: () => record('Skipped'),
          child: const Text('Skip dose'),
        ),
      ),
      if (previous != null)
        action('Undo last change', () {
          widget.store.record(widget.doseKey, previous!);
          setState(() => previous = null);
        }),
    ],
  );
}
