import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'state/app_store.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(MediTrack(store: AppStore(await SharedPreferences.getInstance())));
}
