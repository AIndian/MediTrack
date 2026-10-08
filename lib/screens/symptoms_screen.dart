import 'package:flutter/material.dart';

import '../state/app_store.dart';
import '../widgets/design_widgets.dart';

class Symptoms extends StatefulWidget {
  final AppStore store;
  const Symptoms({super.key, required this.store});
  @override
  State<Symptoms> createState() => _SymptomsState();
}

class _SymptomsState extends State<Symptoms> {
  final name = TextEditingController(), notes = TextEditingController();
  final form = GlobalKey<FormState>();
  String severity = 'Mild';
  @override
  void dispose() {
    name.dispose();
    notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AppPage('Symptoms', [
    Form(
      key: form,
      child: Column(
        children: [
          TextFormField(
            controller: name,
            decoration: const InputDecoration(labelText: 'Symptom'),
            validator: (s) => s!.trim().isEmpty ? 'Enter a symptom' : null,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: severity,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Severity'),
            items: [
              'Mild',
              'Moderate',
              'Severe',
            ].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
            onChanged: (s) => setState(() => severity = s!),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: notes,
            decoration: const InputDecoration(labelText: 'Notes (optional)'),
            maxLines: 3,
          ),
          action('Save symptom', () {
            if (form.currentState!.validate()) {
              widget.store.symptom(name.text, severity, notes.text);
              setState(() {
                name.clear();
                notes.clear();
              });
            }
          }),
        ],
      ),
    ),
    if (widget.store.symptoms.isEmpty) const Text('No symptoms recorded.'),
    for (final s in widget.store.symptoms)
      panel([
        heading(s['name']),
        Text('${s['severity']} • ${s['date']}'),
        Text(s['notes']),
      ]),
  ]);
}
