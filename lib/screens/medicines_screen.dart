import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';
import 'medicine_form_screen.dart';
import 'medicine_details_screen.dart';

class Medicines extends StatelessWidget {
  final AppStore store;
  const Medicines({super.key, required this.store});
  @override
  Widget build(BuildContext context) => AppPage('Your medicines', [
    Text('${store.active.length} active medicines'),
    action('Add medicine', () => open(context, MedicineForm(store: store))),
    if (store.medicines.isEmpty) const Text('Your medicine list is empty.'),
    for (final m in store.medicines)
      panel([
        heading(m.name),
        Text('${m.strength} • ${m.times.join(', ')}'),
        Text(m.archived ? 'Archived' : 'Active'),
        if (m.supply <= 10) const Text('Low supply • Check your refill'),
        action(
          'Open ${m.name}',
          () => open(context, Details(store: store, id: m.id)),
        ),
      ]),
  ]);
}
