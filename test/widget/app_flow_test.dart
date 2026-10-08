import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:meditrack/app.dart';
import 'package:meditrack/widgets/header_clock.dart';
import 'package:meditrack/main.dart' as entry;

import '../support/fixtures.dart';

import 'package:meditrack/screens/today_screen.dart';
import 'package:meditrack/screens/medicines_screen.dart';
import 'package:meditrack/screens/medicine_details_screen.dart';
import 'package:meditrack/screens/medicine_form_screen.dart';
import 'package:meditrack/screens/medicine_review_screen.dart';
import 'package:meditrack/screens/dose_screen.dart';
import 'package:meditrack/screens/history_screen.dart';
import 'package:meditrack/screens/symptoms_screen.dart';
import 'package:meditrack/screens/summary_screen.dart';
import 'package:meditrack/screens/settings_screen.dart';

Future<void> tap(WidgetTester t, String label) async {
  await t.pumpAndSettle();
  final target = find.text(label).last;
  if (find.text(label).evaluate().isEmpty) {
    await t.drag(find.byType(ListView).last, const Offset(0, 2000));
    await t.pumpAndSettle();
    await t.scrollUntilVisible(
      find.text(label),
      200,
      scrollable: find.byType(Scrollable).last,
    );
  }
  await t.ensureVisible(target);
  await t.pumpAndSettle();
  await t.tap(target);
  await t.pumpAndSettle();
}

void main() {
  testWidgets('Application boots through the production entry point', (
    t,
  ) async {
    await fresh();
    await entry.main();
    await t.pumpAndSettle();
    expect(find.text('MediTrack'), findsOneWidget);
    expect(find.textContaining('No medicines scheduled'), findsOneWidget);
  });
  testWidgets('Empty states and complete add, review, edit, archive workflow', (
    t,
  ) async {
    final s = await fresh();
    await t.pumpWidget(MediTrack(store: s));
    expect(find.textContaining('No medicines scheduled'), findsOneWidget);
    await tap(t, 'History');
    expect(find.text('No doses recorded yet.'), findsOneWidget);
    await tap(t, 'Medicines');
    expect(find.text('Your medicine list is empty.'), findsOneWidget);
    await tap(t, 'Add medicine');
    await tap(t, 'Review medicine');
    expect(find.text('Please enter a value'), findsNWidgets(2));
    await t.enterText(find.byType(TextFormField).at(0), 'Sample medicine');
    await t.enterText(find.byType(TextFormField).at(1), '5 mg');
    await t.enterText(find.byType(TextFormField).at(3), '25:00');
    await t.enterText(find.byType(TextFormField).at(4), '-1');
    await tap(t, 'Review medicine');
    expect(find.text('Use times such as 08:00, 18:00'), findsOneWidget);
    expect(find.text('Enter a whole number, zero or more'), findsOneWidget);
    await t.enterText(find.byType(TextFormField).at(3), '18:00, 08:00, 08:00');
    await t.enterText(find.byType(TextFormField).at(4), '8');
    await tap(t, 'Review medicine');
    expect(s.active, isEmpty);
    await tap(t, 'Save medicine');
    expect(s.active.single.times, ['08:00', '18:00']);
    await tap(t, 'Open Sample medicine');
    await tap(t, 'Edit medicine');
    await t.enterText(find.byType(TextFormField).at(1), '10 mg');
    await tap(t, 'Review medicine');
    await tap(t, 'Save medicine');
    expect(s.active.single.strength, '10 mg');
    await tap(t, 'Archive medicine');
    expect(s.active, isEmpty);
    await tap(t, 'Restore medicine');
    expect(s.active.length, 1);
    expect(t.takeException(), isNull);
  });
  testWidgets('Dose logging, persistent undo and history corrections', (
    t,
  ) async {
    final s = await fresh();
    s.put(med);
    await t.pumpWidget(MediTrack(store: s));
    await tap(t, 'Open Sample medicine dose at 08:00');
    await tap(t, 'Mark Taken');
    expect(find.text('Status: Taken'), findsOneWidget);
    await t.pump(const Duration(minutes: 5));
    await tap(t, 'Undo last change');
    expect(find.text('Status: Due'), findsOneWidget);
    await tap(t, 'Skip dose');
    await t.tap(find.byType(BackButton));
    await t.pumpAndSettle();
    await tap(t, 'History');
    await tap(t, 'Taken');
    expect(s.doses.values.single, 'Taken');
    await tap(t, 'Due');
    expect(s.doses, isEmpty);
  });
  testWidgets('Symptoms, summary range and accessibility setting', (t) async {
    final s = await fresh();
    s.put(med);
    s.record(s.doseKey(med, '08:00'), 'Taken');
    await t.pumpWidget(MediTrack(store: s));
    await tap(t, 'More');
    await tap(t, 'Symptoms');
    await tap(t, 'Save symptom');
    expect(find.text('Enter a symptom'), findsOneWidget);
    await t.enterText(find.byType(TextFormField).first, 'Headache');
    await t.enterText(find.byType(TextFormField).last, 'After lunch');
    await tap(t, 'Mild');
    await tap(t, 'Moderate');
    await tap(t, 'Save symptom');
    expect(s.symptoms.single['severity'], 'Moderate');
    await t.tap(find.byType(BackButton));
    await t.pumpAndSettle();
    await tap(t, 'Appointment summary');
    expect(find.text('1 taken of 1 recorded doses'), findsOneWidget);
    await tap(t, 'Last 7 days');
    await tap(t, 'Last 30 days');
    expect(find.textContaining('Headache'), findsOneWidget);
    await t.tap(find.byType(BackButton));
    await t.pumpAndSettle();
    await tap(t, 'Larger text');
    expect(s.largeText, true);
    expect(t.takeException(), isNull);
  });
  testWidgets('All screens reflow on a narrow phone at 200 percent', (t) async {
    t.view.physicalSize = const Size(393, 852);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.resetPhysicalSize);
    addTearDown(t.view.resetDevicePixelRatio);
    final s = await fresh();
    s.put(med);
    s.setLargeText(true);
    s.record(s.doseKey(med, '08:00'), 'Taken');
    final pages = <Widget>[
      Today(store: s),
      Medicines(store: s),
      Details(store: s, id: '1'),
      MedicineForm(store: s),
      Review(store: s, medicine: med),
      Dose(store: s, medicine: med, time: '08:00'),
      History(store: s),
      Symptoms(store: s),
      Summary(store: s),
      Settings(store: s),
    ];
    for (final page in pages) {
      await t.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(2)),
            child: page,
          ),
        ),
      );
      await t.pumpAndSettle();
      expect(
        find.byType(HeaderClock),
        findsOneWidget,
        reason: '${page.runtimeType} shows the clock',
      );
      await t.drag(find.byType(ListView).first, const Offset(0, -1600));
      await t.pumpAndSettle();
      expect(
        t.takeException(),
        isNull,
        reason: '${page.runtimeType} must reflow',
      );
    }
    await t.pumpWidget(MediTrack(store: s));
    await t.pumpAndSettle();
    expect(t.takeException(), isNull);
  });
  testWidgets('Labeled controls and minimum mobile touch targets', (t) async {
    final handle = t.ensureSemantics();
    final s = await fresh();
    await t.pumpWidget(MediTrack(store: s));
    await t.pumpAndSettle();
    await expectLater(t, meetsGuideline(androidTapTargetGuideline));
    await expectLater(t, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });
}
