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
  final nameFocus = FocusNode();
  String severity = 'Mild';
  String message = '';
  bool saving = false;
  @override
  void dispose() {
    nameFocus.dispose();
    name.dispose();
    notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AppPage('Symptoms', [
    const Text('Symptom is required. Notes are optional.'),
    Form(
      key: form,
      child: Column(
        children: [
          labeledField(
            'Symptom',
            TextFormField(
              controller: name,
              focusNode: nameFocus,
              validator: (s) => s!.trim().isEmpty ? 'Enter a symptom' : null,
            ),
          ),
          const SizedBox(height: 16),
          labeledField(
            'Severity',
            DropdownButtonFormField<String>(
              initialValue: severity,
              isExpanded: true,
              items: [
                'Mild',
                'Moderate',
                'Severe',
              ].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (s) => setState(() => severity = s!),
            ),
          ),
          const SizedBox(height: 16),
          labeledField(
            'Notes (optional)',
            TextFormField(controller: notes, maxLines: 3),
          ),
          action('Save symptom', () async {
            if (saving) return;
            if (!form.currentState!.validate()) {
              nameFocus.requestFocus();
              return;
            }
            {
              saving = true;
              widget.store.symptom(name.text, severity, notes.text);
              await widget.store.pending;
              if (!mounted) return;
              setState(() {
                saving = false;
                message = widget.store.error == null
                    ? 'Symptom saved on this device.'
                    : 'Symptom kept in memory. Could not save on this device.';
                name.clear();
                notes.clear();
              });
            }
          }),
        ],
      ),
    ),
    Semantics(liveRegion: true, child: Text(message)),
    if (widget.store.symptoms.isEmpty) const Text('No symptoms recorded.'),
    for (final s in widget.store.symptoms)
      panel([
        heading(s['name']),
        Text('${s['severity']} • ${s['date']}'),
        Text(s['notes']),
      ]),
  ]);
}
