import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:meditrack/app.dart';
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

import '../support/fixtures.dart';

void main() {
  testWidgets(
    'All screens retain content at WCAG reflow sizes in both orientations',
    (t) async {
      t.view.devicePixelRatio = 1;
      addTearDown(t.view.resetPhysicalSize);
      addTearDown(t.view.resetDevicePixelRatio);
      final store = await fresh();
      store.put(med);
      store.record(store.doseKey(med, '08:00'), 'Taken');
      await t.pumpWidget(MediTrack(store: store));
      final theme = t.widget<MaterialApp>(find.byType(MaterialApp)).theme;
      final pages = <Widget>[
        Today(store: store),
        Medicines(store: store),
        Details(store: store, id: med.id),
        MedicineForm(store: store),
        Review(store: store, medicine: med),
        Dose(store: store, medicine: med, time: '08:00'),
        History(store: store),
        Symptoms(store: store),
        Summary(store: store),
        Settings(store: store),
      ];
      for (final size in [
        const Size(320, 1024),
        const Size(1280, 256),
        const Size(393, 852),
        const Size(852, 393),
      ]) {
        t.view.physicalSize = size;
        for (final scale in [1.0, 2.0]) {
          for (final page in pages) {
            await t.pumpWidget(
              MaterialApp(
                theme: theme,
                home: MediaQuery(
                  data: MediaQueryData(
                    size: size,
                    textScaler: TextScaler.linear(scale),
                  ),
                  child: page,
                ),
              ),
            );
            await t.pumpAndSettle();
            await t.drag(find.byType(ListView).first, const Offset(0, -2000));
            await t.pumpAndSettle();
            expect(
              t.takeException(),
              isNull,
              reason: '${page.runtimeType} $size at $scale',
            );
          }
          store.setTextScale(scale);
          await t.pumpWidget(MediTrack(store: store));
          await t.pumpAndSettle();
          expect(
            t.takeException(),
            isNull,
            reason: 'Home navigation $size at $scale',
          );
        }
      }
      t.view.physicalSize = const Size(320, 256);
      store.error = 'Could not save. Keep the app open and free device storage before trying again.';
      await t.pumpWidget(MediTrack(store: store));
      await t.pumpAndSettle();
      expect(
        t.takeException(),
        isNull,
        reason: 'Storage error remains scrollable at 200% text',
      );
      await t.pumpWidget(const SizedBox());
    },
  );
}
