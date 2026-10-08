import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../models/medicine.dart';
import '../widgets/design_widgets.dart';
import 'medicine_review_screen.dart';

class MedicineForm extends StatefulWidget {
  final AppStore store;
  final Medicine? medicine;
  const MedicineForm({super.key, required this.store, this.medicine});
  @override
  State<MedicineForm> createState() => _MedicineFormState();
}

class _MedicineFormState extends State<MedicineForm> {
  final form = GlobalKey<FormState>();
  late final fields = [
    TextEditingController(text: widget.medicine?.name),
    TextEditingController(text: widget.medicine?.strength),
    TextEditingController(text: widget.medicine?.instructions),
    TextEditingController(text: widget.medicine?.times.join(', ') ?? '08:00'),
    TextEditingController(text: '${widget.medicine?.supply ?? 30}'),
  ];
  @override
  void dispose() {
    for (final c in fields) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(
    BuildContext context,
  ) => AppPage(widget.medicine == null ? 'Add medicine' : 'Edit medicine', [
    const Text(
      'Copy details from your prescription label. Times use the 24-hour clock.',
    ),
    Form(
      key: form,
      child: Column(
        children: [
          for (var i = 0; i < fields.length; i++) ...[
            if (i == 0) heading('Medicine information'),
            if (i == 3)
              Padding(
                padding: const EdgeInsets.only(top: 24),
                child: heading('Schedule & supply'),
              ),
            Padding(
              padding: const EdgeInsets.only(top: 20),
              child: TextFormField(
                controller: fields[i],
                decoration: InputDecoration(
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  labelText: [
                    'Medicine name',
                    'Strength / dosage',
                    'Instructions (optional)',
                    'Daily times (HH:mm, separated by commas)',
                    'Supply in doses',
                  ][i],
                ),
                validator: (v) {
                  if (i != 2 && (v == null || v.trim().isEmpty)) {
                    return 'Please enter a value';
                  }
                  if (i == 3 &&
                      v!
                          .split(',')
                          .any(
                            (t) =>
                                !RegExp(r'^([01]\d|2[0-3]):[0-5]\d$')
                                    .hasMatch(t.trim()),
                          )) {
                    return 'Use times such as 08:00, 18:00';
                  }
                  if (i == 4 &&
                      (int.tryParse(v!) == null || int.parse(v) < 0)) {
                    return 'Enter a whole number, zero or more';
                  }
                  return null;
                },
              ),
            ),
          ],
          action('Review medicine', () async {
            if (!form.currentState!.validate()) {
              return;
            }
            final m = Medicine(
              id:
                  widget.medicine?.id ??
                  DateTime.now().microsecondsSinceEpoch.toString(),
              name: fields[0].text.trim(),
              strength: fields[1].text.trim(),
              instructions: fields[2].text.trim(),
              times:
                  fields[3].text
                      .split(',')
                      .map((t) => t.trim())
                      .toSet()
                      .toList()
                    ..sort(),
              supply: int.parse(fields[4].text),
              archived: widget.medicine?.archived ?? false,
            );
            final saved = await Navigator.push<bool>(
              context,
              MaterialPageRoute(
                builder: (_) => Review(store: widget.store, medicine: m),
              ),
            );
            if (saved == true && context.mounted) {
              Navigator.pop(context);
            }
          }),
        ],
      ),
    ),
  ]);
}
