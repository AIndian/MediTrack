import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../models/medicine.dart';
import '../widgets/design_widgets.dart';

class Review extends StatelessWidget {
  final AppStore store;
  final Medicine medicine;
  const Review({super.key, required this.store, required this.medicine});
  @override
  Widget build(BuildContext context) => AppPage('Review medicine', [
    panel([
      medicineHeading(medicine),
      Text(medicine.instructions),
      Text('Every day at ${medicine.times.join(', ')}'),
      Text('${medicine.supply} doses recorded'),
    ]),
    const Text('Check these details against your prescription before saving.'),
    action('Save medicine', () {
      store.put(medicine);
      Navigator.pop(context, true);
    }),
    OutlinedButton(
      onPressed: () => Navigator.pop(context),
      child: const Text('Edit details'),
    ),
  ]);
}
