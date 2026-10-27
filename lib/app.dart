import 'package:flutter/material.dart';

import 'state/app_store.dart';
import 'screens/home_shell.dart';

class MediTrack extends StatelessWidget {
  final AppStore store;
  const MediTrack({super.key, required this.store});
  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: store,
    builder: (context, _) => MaterialApp(
      title: 'MediTrack',
      locale: const Locale('en'),
      supportedLocales: const [Locale('en')],
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        focusColor: const Color(0xffDCCAF5),
        textButtonTheme: TextButtonThemeData(
          style: ButtonStyle(
            side: WidgetStateProperty.resolveWith(
              (states) => states.contains(WidgetState.focused)
                  ? const BorderSide(color: Color(0xff703DB2), width: 3)
                  : null,
            ),
          ),
        ),
        scaffoldBackgroundColor: const Color(0xffF6FAF9),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff075E64))
            .copyWith(
              primary: const Color(0xff075E64),
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: const Color(0xff183B42),
              onSurfaceVariant: const Color(0xff52686C),
              error: const Color(0xffA52B3C),
              onError: Colors.white,
              errorContainer: const Color(0xffFDE8EA),
              onErrorContainer: const Color(0xffA52B3C),
              outline: const Color(0xff687F82),
              outlineVariant: const Color(0xff687F82),
            ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(fontSize: 16, height: 1.5),
          bodyLarge: TextStyle(fontSize: 16, height: 1.5),
          labelLarge: TextStyle(fontSize: 16, height: 1.5),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            side: WidgetStateBorderSide.resolveWith(
              (states) => states.contains(WidgetState.focused)
                  ? const BorderSide(color: Color(0xffDCCAF5), width: 3)
                  : BorderSide.none,
            ),
            minimumSize: const Size(56, 56),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            side: WidgetStateBorderSide.resolveWith(
              (states) => states.contains(WidgetState.focused)
                  ? const BorderSide(color: Color(0xff703DB2), width: 3)
                  : const BorderSide(color: Color(0xff687F82)),
            ),
            minimumSize: const Size(56, 56),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        inputDecorationTheme: const InputDecorationTheme(
          errorMaxLines: 6,
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(11)),
            borderSide: BorderSide(color: Color(0xff703DB2), width: 3),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(11)),
          ),
          filled: true,
          fillColor: Colors.white,
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(11)),
            borderSide: BorderSide(color: Color(0xff687F82)),
          ),
        ),
      ),
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(
          textScaler:
              MediaQuery.textScalerOf(context).scale(16) >= 16 * store.textScale
              ? MediaQuery.textScalerOf(context)
              : TextScaler.linear(store.textScale),
        ),
        child: Column(children: [
          if (store.error != null)
            SafeArea(child: Semantics(liveRegion: true, child: Padding(
              padding: const EdgeInsets.all(12),
              child: Text(store.error!, style: const TextStyle(color: Color(0xffA52B3C))),
            ))),
          Expanded(child: child!),
        ]),
      ),
      home: Home(store: store),
    ),
  );
}
