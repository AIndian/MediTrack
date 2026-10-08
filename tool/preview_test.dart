// Optional visual QA renderer; run with a local TrueType font path.
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:meditrack/app.dart';
import 'package:meditrack/models/medicine.dart';
import 'package:meditrack/state/app_store.dart';

void main() {
  testWidgets('Render a phone preview with sample data', (tester) async {
    const font = String.fromEnvironment('VISUAL_FONT');
    final loader = FontLoader('Roboto')
      ..addFont(
        Future.value(ByteData.sublistView(File(font).readAsBytesSync())),
      );
    await loader.load();
    final icons = FontLoader('MaterialIcons')
      ..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'));
    await icons.load();
    tester.view.physicalSize = const Size(393, 852);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    // This optional widget test lives in tool/ to keep it out of the coverage suite.
    // ignore: invalid_use_of_visible_for_testing_member
    SharedPreferences.setMockInitialValues({});
    final store = AppStore(
      await SharedPreferences.getInstance(),
      clock: () => DateTime(2026, 10, 8, 8),
    );
    store.put(
      const Medicine(
        id: 'demo',
        name: 'Metformin',
        strength: '500 mg · 1 tablet',
        instructions: 'With breakfast and dinner',
        times: ['08:00', '18:00'],
        supply: 8,
      ),
    );
    final key = GlobalKey();
    await tester.pumpWidget(
      RepaintBoundary(
        key: key,
        child: MediTrack(store: store),
      ),
    );
    await tester.pumpAndSettle();
    final boundary =
        key.currentContext!.findRenderObject() as RenderRepaintBoundary;
    await tester.runAsync(() async {
      final image = await boundary.toImage();
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      Directory('reports').createSync(recursive: true);
      await File('reports/flutter-phone.png')
          .writeAsBytes(bytes!.buffer.asUint8List());
      image.dispose();
    });
    expect(tester.takeException(), isNull);
  }, skip: const String.fromEnvironment('VISUAL_FONT').isEmpty);
}
