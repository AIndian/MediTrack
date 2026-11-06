import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:meditrack/app.dart';
import 'package:meditrack/screens/medicine_form_screen.dart';
import 'package:meditrack/screens/medicine_review_screen.dart';
import 'package:meditrack/screens/symptoms_screen.dart';
import 'package:meditrack/screens/today_screen.dart';
import 'package:meditrack/screens/history_screen.dart';
import 'package:meditrack/widgets/header_clock.dart';

import '../support/fixtures.dart';
import '../widget/app_flow_test.dart' show tap;

void main() {
  testWidgets(
    'Validation focuses the first invalid field and preserves draft',
    (t) async {
      final store = await fresh();
      await t.pumpWidget(MaterialApp(home: MedicineForm(store: store)));
      await tap(t, 'Review medicine');
      final first = t.widget<TextFormField>(find.byType(TextFormField).first);
      expect(
        t.widget<TextField>(find.byType(TextField).first).focusNode!.hasFocus,
        isTrue,
      );
      expect(find.text('Enter a medicine name'), findsOneWidget);
      await t.enterText(find.byType(TextFormField).first, med.name);
      await tap(t, 'Review medicine');
      expect(
        t.widget<TextField>(find.byType(TextField).at(1)).focusNode!.hasFocus,
        isTrue,
      );
      expect(first.controller!.text, med.name);
      expect(store.active, isEmpty);
      await t.pumpWidget(const SizedBox());
    },
  );

  testWidgets(
    'Clock pause/resume is exposed and has no automatic announcements',
    (t) async {
      var time = DateTime(2026, 10, 8, 23, 59);
      final semantics = t.ensureSemantics();
      await t.pumpWidget(MaterialApp(home: HeaderClock(now: () => time)));
      await t.tap(find.text('Pause clock updates'));
      time = time.add(const Duration(minutes: 2));
      await t.pump(const Duration(seconds: 2));
      expect(find.bySemanticsLabel(RegExp('Paused time:')), findsOneWidget);
      expect(
        t
            .getSemantics(find.bySemanticsLabel(RegExp('Paused time:')))
            .getSemanticsData()
            .flagsCollection
            .isLiveRegion,
        isFalse,
      );
      await t.tap(find.text('Resume clock updates'));
      await t.pump();
      expect(find.bySemanticsLabel(RegExp('Current time:')), findsOneWidget);
      await t.pumpWidget(const SizedBox());
      semantics.dispose();
    },
  );

  testWidgets(
    'Review stays open on save failure and announces the error on the route',
    (t) async {
      final store = await fresh();
      store.error = 'Could not save. Keep the app open.';
      await t.pumpWidget(MediTrack(store: store));
      final navigator = t.state<NavigatorState>(find.byType(Navigator));
      navigator.push(
        MaterialPageRoute<void>(
          builder: (_) => Review(store: store, medicine: med),
        ),
      );
      await t.pumpAndSettle();
      await tap(t, 'Save medicine');
      expect(find.byType(Review), findsOneWidget);
      expect(find.text(store.error!), findsOneWidget);
      await t.pumpWidget(const SizedBox());
    },
  );

  testWidgets('Symptom success remains a live status message', (t) async {
    final semantics = t.ensureSemantics();
    final store = await fresh();
    await t.pumpWidget(MaterialApp(home: Symptoms(store: store)));
    await t.enterText(find.byType(TextFormField).first, 'Sample symptom');
    await tap(t, 'Save symptom');
    expect(
      t
          .getSemantics(find.text('Symptom saved on this device.'))
          .getSemanticsData()
          .flagsCollection
          .isLiveRegion,
      isTrue,
    );
    await store.pending;
    expect(store.prefs.getString('meditrack.v1'), contains('Sample symptom'));
    await t.pumpWidget(const SizedBox());
    semantics.dispose();
  });

  testWidgets(
    'Page headings and skip target survive keyboard traversal without writes',
    (t) async {
      final store = await fresh();
      await t.pumpWidget(MediTrack(store: store));
      await t.pumpAndSettle();
      await tap(t, 'Skip to content');
      expect(FocusManager.instance.primaryFocus!.debugLabel, 'Page heading');
      await t.sendKeyEvent(LogicalKeyboardKey.tab);
      await t.pumpAndSettle();
      expect(store.medicines, isEmpty);
      await t.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await t.sendKeyEvent(LogicalKeyboardKey.tab);
      await t.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      await t.pumpAndSettle();
      expect(store.medicines, isEmpty);
      expect(find.byType(Today), findsOneWidget);
      await t.pumpWidget(const SizedBox());
    },
  );

  testWidgets('Removed history records leave a focused live result', (t) async {
    final store = await fresh();
    store.put(med);
    store.record(store.doseKey(med, '08:00'), 'Taken');
    await t.pumpWidget(MaterialApp(home: History(store: store)));
    await tap(t, 'Due');
    final result = find.text(
      '${store.doseLabel(store.doseKey(med, '08:00'))}: Due',
    );
    expect(result, findsOneWidget);
    expect(Focus.of(t.element(result)).hasFocus, isTrue);
    expect(store.history(30), isEmpty);
    await t.pumpWidget(const SizedBox());
  });

  testWidgets(
    'Short landscape keyboard traversal reaches main navigation after scrolling',
    (t) async {
      t.view.physicalSize = const Size(1280, 256);
      t.view.devicePixelRatio = 1;
      addTearDown(t.view.resetPhysicalSize);
      addTearDown(t.view.resetDevicePixelRatio);
      final store = await fresh();
      store.put(med);
      await t.pumpWidget(MediTrack(store: store));
      await t.pumpAndSettle();
      await tap(t, 'Skip to content');
      var reached = false;
      for (var count = 0; count < 40 && !reached; count++) {
        await t.sendKeyEvent(LogicalKeyboardKey.tab);
        await t.pumpAndSettle();
        reached = Focus.of(t.element(find.text('Medicines'))).hasFocus;
      }
      expect(reached, isTrue);
      await t.pumpWidget(const SizedBox());
    },
  );

  testWidgets(
    'Primary pages do not retain Back after background store updates',
    (t) async {
      final store = await fresh();
      store.put(med);
      await t.pumpWidget(MediTrack(store: store));
      await tap(t, 'Medicines');
      await tap(t, 'Open Sample medicine');
      await tap(t, 'Archive medicine');
      await tap(t, 'Restore medicine');
      await t.ensureVisible(find.widgetWithText(TextButton, 'Back'));
      await t.pumpAndSettle();
      await t.tap(find.widgetWithText(TextButton, 'Back'));
      await t.pumpAndSettle();
      expect(find.widgetWithText(TextButton, 'Back'), findsNothing);
      await t.pumpWidget(const SizedBox());
    },
  );

  testWidgets(
    'Production theme text and control colors meet contrast thresholds',
    (t) async {
      await t.pumpWidget(MediTrack(store: await fresh()));
      final theme = Theme.of(t.element(find.byType(Today)));
      double ratio(Color a, Color b) {
        final values = [a.computeLuminance(), b.computeLuminance()]..sort();
        return (values.last + .05) / (values.first + .05);
      }

      final colors = theme.colorScheme;
      for (final pair in [
        (colors.onSurface, colors.surface),
        (colors.onSurfaceVariant, colors.surface),
        (colors.onPrimary, colors.primary),
        (colors.error, colors.surface),
        (colors.onErrorContainer, colors.errorContainer),
      ]) {
        expect(ratio(pair.$1, pair.$2), greaterThanOrEqualTo(4.5));
      }
      expect(ratio(colors.outline, colors.surface), greaterThanOrEqualTo(3));
      expect(
        ratio(const Color(0xff703DB2), colors.surface),
        greaterThanOrEqualTo(3),
      );
      expect(
        ratio(const Color(0xffDCCAF5), colors.primary),
        greaterThanOrEqualTo(3),
      );
      await t.pumpWidget(const SizedBox());
    },
  );
}
