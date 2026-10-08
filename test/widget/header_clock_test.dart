import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:meditrack/widgets/design_widgets.dart';
import 'package:meditrack/widgets/header_clock.dart';

void main() {
  testWidgets(
    'Clock follows minute, midnight and resume; respects time format',
    (tester) async {
      var now = DateTime(2026, 10, 8, 23, 59, 59);
      final semantics = tester.ensureSemantics();
      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(alwaysUse24HourFormat: true),
            child: HeaderClock(now: () => now),
          ),
        ),
      );
      expect(find.text('23:59'), findsOneWidget);
      expect(find.bySemanticsLabel('Current time: 23:59'), findsOneWidget);
      now = now.add(const Duration(seconds: 1));
      await tester.pump(const Duration(seconds: 1));
      expect(find.text('00:00'), findsOneWidget);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
      now = DateTime(2026, 10, 9, 14, 35);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pump();
      expect(find.text('14:35'), findsOneWidget);
      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(alwaysUse24HourFormat: false),
            child: HeaderClock(now: () => now),
          ),
        ),
      );
      expect(find.textContaining('2:35'), findsOneWidget);
      expect(find.textContaining('PM'), findsOneWidget);
      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(minutes: 1));
      expect(tester.takeException(), isNull);
      semantics.dispose();
    },
  );

  testWidgets('Clock stays top right with back navigation at 200 percent', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(393, 852);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final navigator = GlobalKey<NavigatorState>();
    await tester.pumpWidget(
      MaterialApp(
        navigatorKey: navigator,
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context)
              .copyWith(textScaler: const TextScaler.linear(2)),
          child: child!,
        ),
        home: const AppPage('Today', []),
      ),
    );
    navigator.currentState!.push(
      MaterialPageRoute<void>(
        builder: (_) => const AppPage('Medicine details', []),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byType(BackButton), findsOneWidget);
    expect(find.byType(HeaderClock), findsOneWidget);
    expect(tester.getTopRight(find.byType(HeaderClock)).dx, closeTo(373, 1));
    expect(
      tester.getTopRight(find.byType(HeaderClock)).dy,
      lessThan(tester.getTopLeft(find.text('MediTrack')).dy),
    );
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
  });
}
