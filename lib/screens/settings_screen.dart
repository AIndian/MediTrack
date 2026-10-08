import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';
import 'symptoms_screen.dart';
import 'summary_screen.dart';

class Settings extends StatelessWidget {
  final AppStore store;
  const Settings({super.key, required this.store});
  @override
  Widget build(BuildContext context) => AppPage('Settings & sharing', [
    SwitchListTile(
      contentPadding: EdgeInsets.zero,
      title: const Text('Larger text'),
      subtitle: const Text('Quick switch: 100% or 200%'),
      value: store.largeText,
      onChanged: store.setLargeText,
    ),
    Text('Text size: ${(store.textScale * 100).round()}%'),
    Semantics(
      label: 'Text size',
      child: Slider(
        value: store.textScale,
        min: 1.0,
        max: 2.0,
        divisions: 4,
        label: '${(store.textScale * 100).round()}%',
        semanticFormatterCallback: (value) => '${(value * 100).round()}%',
        onChanged: store.setTextScale,
      ),
    ),
    const Text('100% · 125% · 150% · 175% · 200%'),
    const Text('Your device’s larger text setting still applies.'),
    action('Symptoms', () => open(context, Symptoms(store: store))),
    action('Appointment summary', () => open(context, Summary(store: store))),
    panel([heading('Reminders'), const Text('Reminders are off.')]),
    panel([
      heading('Privacy & sharing'),
      const Text('Saved on this device. Sharing is off.'),
    ]),
    const Text(
      'Prototype storage is not encrypted. Use sample information only.',
    ),
  ]);
}
