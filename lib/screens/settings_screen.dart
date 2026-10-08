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
      subtitle: const Text('Use at least 200% text size'),
      value: store.largeText,
      onChanged: store.setLargeText,
    ),
    action('Symptoms', () => open(context, Symptoms(store: store))),
    action('Appointment summary', () => open(context, Summary(store: store))),
    panel([
      heading('Reminders'),
      const Text(
        'System notifications and spoken reminders are not connected. No reminders will be delivered.',
      ),
    ]),
    panel([
      heading('Privacy & sharing'),
      const Text(
        'Records are stored locally. No caregiver has access. Cloud sync, caregiver invitations and exports are unavailable.',
      ),
    ]),
    const Text(
      'Prototype storage is not encrypted. Use sample information only.',
    ),
  ]);
}
