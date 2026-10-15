
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'state/app_store.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  final store = AppStore(prefs);

  runApp(
    ChangeNotifierProvider<AppStore>.value(
      value: store,
      child: MediTrack(store: store),
    ),
  );
}
