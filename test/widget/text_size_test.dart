import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:meditrack/app.dart';
import 'package:meditrack/screens/settings_screen.dart';

import '../support/fixtures.dart';

void main() {
  testWidgets(
    'Slider offers every text size and stays in sync with the toggle',
    (tester) async {
      tester.view.physicalSize = const Size(393, 852);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final semantics = tester.ensureSemantics();
      Future<void> show(Finder target) async {
        await tester.drag(find.byType(ListView), const Offset(0, 3000));
        await tester.pumpAndSettle();
        await tester.scrollUntilVisible(
          target,
          150,
          scrollable: find.byType(Scrollable).last,
        );
        await tester.pumpAndSettle();
      }

      final store = await fresh();
      await tester.pumpWidget(MediTrack(store: store));
      await tester.tap(find.text('More'));
      await tester.pumpAndSettle();
      expect(find.text('Text size: 100%'), findsOneWidget);
      for (final scale in [1.25, 1.5, 1.75, 2.0]) {
        await show(find.byType(Slider));
        await tester.pumpAndSettle();
        tester.semantics.increase(
          find.semantics.byValue('${(store.textScale * 100).round()}%'),
        );
        await tester.pumpAndSettle();
        expect(store.textScale, scale);
        expect(
          find.text('Text size: ${(scale * 100).round()}%'),
          findsOneWidget,
        );
        expect(
          MediaQuery.textScalerOf(tester.element(find.byType(Settings)))
              .scale(16),
          16 * scale,
        );
        expect(store.largeText, isTrue);
        expect(tester.takeException(), isNull);
      }
      await show(find.byType(SwitchListTile));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(SwitchListTile));
      await tester.pumpAndSettle();
      expect(store.textScale, 1.0);
      await show(find.byType(Slider));
      expect(tester.widget<Slider>(find.byType(Slider)).value, 1.0);
      await show(find.byType(SwitchListTile));
      await tester.tap(find.byType(SwitchListTile));
      await tester.pumpAndSettle();
      expect(store.textScale, 2.0);
      await show(find.byType(Slider));
      await tester.pumpAndSettle();
      tester.semantics.decrease(find.semantics.byValue('200%'));
      await tester.pumpAndSettle();
      expect(store.textScale, 1.75);
      await store.pending;
      await tester.pumpWidget(const SizedBox());
      semantics.dispose();
    },
  );

  testWidgets('App respects a larger system font setting', (tester) async {
    tester.platformDispatcher.textScaleFactorTestValue = 2.5;
    addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
    final store = await fresh();
    store.setTextScale(1.25);
    await tester.pumpWidget(MediTrack(store: store));
    await tester.pumpAndSettle();
    final context = tester.element(find.text('MediTrack'));
    expect(MediaQuery.textScalerOf(context).scale(16), 40);
    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('Today uses the short connection notice', (tester) async {
    final store = await fresh();
    await tester.pumpWidget(MediTrack(store: store));
    await tester.pumpAndSettle();
    expect(find.text('No connection'), findsOneWidget);
    expect(find.textContaining('Notifications are unavailable'), findsNothing);
  });
}
