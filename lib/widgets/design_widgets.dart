import 'package:flutter/material.dart';

import '../models/medicine.dart';

void open(BuildContext context, Widget page) =>
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => page));
Widget heading(String text) => Semantics(
  header: true,
  child: Text(
    text,
    style: const TextStyle(
      fontSize: 26,
      fontWeight: FontWeight.w700,
      height: 1.5,
    ),
  ),
);
Widget action(String text, VoidCallback callback) => Padding(
  padding: const EdgeInsets.only(top: 12),
  child: FilledButton(
    onPressed: callback,
    child: Text(text, textAlign: TextAlign.center),
  ),
);
Widget panel(List<Widget> children) => Card(
  elevation: 0,
  color: Colors.white,
  margin: const EdgeInsets.symmetric(vertical: 8),
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(18),
    side: const BorderSide(color: Color(0xffD5E3E0)),
  ),
  child: Padding(
    padding: const EdgeInsets.all(20),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: children,
    ),
  ),
);

const subtitles = {
  'Today': 'Your daily medication plan',
  'Your medicines': 'All your information, in one place',
  'Medicine details': 'Review your saved information',
  'Add medicine': 'Step 1 of 2 · Enter details',
  'Edit medicine': 'Step 1 of 2 · Enter details',
  'Review medicine': 'Step 2 of 2 · Check before saving',
  'Medication reminder': 'Name, dose, and saved instructions',
  'Dose history': 'Review or correct a record',
  'Symptoms': 'Keep a note for your next visit',
  'Appointment summary': 'A clear view of your recent health',
  'Settings & sharing': 'Your preferences and privacy',
};
Widget badge(String status) {
  final taken = status == 'Taken', skipped = status == 'Skipped';
  final color = taken
      ? const Color(0xff14653F)
      : skipped
      ? const Color(0xff795000)
      : const Color(0xff075E64);
  return Semantics(
    liveRegion: true,
    child: Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 12),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: taken
              ? const Color(0xffE3F4E9)
              : skipped
              ? const Color(0xffFFF1CE)
              : const Color(0xffE8F3F1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color),
        ),
        child: Wrap(
          spacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Icon(
              taken
                  ? Icons.check_circle_outline
                  : skipped
                  ? Icons.remove_circle_outline
                  : Icons.schedule,
              size: 20,
              color: color,
            ),
            Text(
              'Status: $status',
              style: TextStyle(color: color, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    ),
  );
}

Widget medicineHeading(Medicine m) => Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: const Color(0xffE8F3F1),
        borderRadius: BorderRadius.circular(14),
      ),
      child: const Icon(Icons.medication_outlined, color: Color(0xff075E64)),
    ),
    const SizedBox(height: 12),
    heading(m.name),
    Text(m.strength, style: const TextStyle(color: Color(0xff52686C))),
  ],
);

class AppPage extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final List<Widget> side;
  const AppPage(this.title, this.children, {super.key, this.side = const []});
  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: Column(
        children: [
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Color(0xffD5E3E0))),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 11),
            child: Row(
              children: [
                if (Navigator.canPop(context))
                  BackButton(onPressed: () => Navigator.pop(context)),
                const Icon(
                  Icons.health_and_safety_outlined,
                  color: Color(0xff075E64),
                  size: 26,
                ),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'MediTrack',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1120),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final wide =
                        constraints.maxWidth >= 700 &&
                        MediaQuery.textScalerOf(context).scale(1) < 1.5;
                    return ListView(
                      padding: EdgeInsets.all(wide ? 32 : 20),
                      children: [
                        Semantics(
                          header: true,
                          child: Text(
                            title,
                            style: const TextStyle(
                              fontSize: 32,
                              height: 1.5,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -1,
                            ),
                          ),
                        ),
                        Text(
                          subtitles[title] ?? '',
                          style: const TextStyle(color: Color(0xff52686C)),
                        ),
                        const SizedBox(height: 24),
                        if (wide && side.isNotEmpty)
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                flex: 6,
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: children,
                                ),
                              ),
                              const SizedBox(width: 24),
                              Expanded(
                                flex: 4,
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: side,
                                ),
                              ),
                            ],
                          )
                        else ...[
                          ...children,
                          ...side,
                        ],
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
