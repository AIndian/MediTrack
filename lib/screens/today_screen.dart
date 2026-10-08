import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';
import '../widgets/dose_controls.dart';
import 'dose_screen.dart';
import 'medicine_form_screen.dart';
import 'history_screen.dart';
import 'symptoms_screen.dart';
import 'summary_screen.dart';

class Today extends StatelessWidget {
  final AppStore store;
  const Today({super.key, required this.store});
  @override
  Widget build(BuildContext context) {
    final slots = [
      for (final m in store.active)
        for (final t in m.times) (m, t),
    ]..sort((a, b) => a.$2.compareTo(b.$2));
    final taken = slots
        .where(
          (slot) => store.status(store.doseKey(slot.$1, slot.$2)) == 'Taken',
        )
        .length;
    return AppPage(
      'Today',
      [
        Text(store.day),
        if (slots.isEmpty)
          const Text(
            'No medicines scheduled today. Add your first medicine to get started.',
          ),
        for (var i = 0; i < slots.length; i++) ...[
          if (i == 0)
            heading('Next dose')
          else if (i == 1)
            heading('Later today'),
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: i == 0
                    ? const Color(0xff075E64)
                    : const Color(0xffD5E3E0),
                width: i == 0 ? 2 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                medicineHeading(slots[i].$1),
                badge(store.status(store.doseKey(slots[i].$1, slots[i].$2))),
                Text(
                  slots[i].$2,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                Text(slots[i].$1.instructions),
                if (i == 0)
                  DoseControls(
                    key: ValueKey(store.doseKey(slots[i].$1, slots[i].$2)),
                    store: store,
                    doseKey: store.doseKey(slots[i].$1, slots[i].$2),
                  ),
                action(
                  'Open ${slots[i].$1.name} dose at ${slots[i].$2}',
                  () => open(
                    context,
                    Dose(
                      store: store,
                      medicine: slots[i].$1,
                      time: slots[i].$2,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        action('Add medicine', () => open(context, MedicineForm(store: store))),
      ],
      side: [
        panel([
          heading('Your day, at a glance'),
          Text('$taken of ${slots.length} doses recorded Taken'),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: slots.isEmpty ? 0 : taken / slots.length,
            minHeight: 12,
            semanticsLabel: 'Doses recorded today',
          ),
          action(
            'View dose history',
            () => open(
              context,
              ListenableBuilder(
                listenable: store,
                builder: (_, _) => History(store: store),
              ),
            ),
          ),
        ]),
        panel([
          const Text('On this device • No cloud connection'),
          const Text(
            'Notifications are unavailable in this build. Use your usual reminder system.',
          ),
        ]),
        action('Log symptom', () => open(context, Symptoms(store: store))),
        action(
          'Appointment summary',
          () => open(context, Summary(store: store)),
        ),
      ],
    );
  }
}
