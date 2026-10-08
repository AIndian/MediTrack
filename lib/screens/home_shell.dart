import 'package:flutter/material.dart';

import '../state/app_store.dart';
import 'today_screen.dart';
import 'medicines_screen.dart';
import 'history_screen.dart';
import 'settings_screen.dart';

class Home extends StatefulWidget {
  final AppStore store;
  const Home({super.key, required this.store});
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  int tab = 0;
  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: widget.store,
    builder: (context, _) {
      final s = widget.store;
      final pages = [
        Today(store: s),
        Medicines(store: s),
        History(store: s),
        Settings(store: s),
      ];
      const labels = ['Today', 'Medicines', 'History', 'More'];
      const icons = [
        Icons.today_outlined,
        Icons.medication_outlined,
        Icons.history,
        Icons.more_horiz,
      ];
      final wide = MediaQuery.sizeOf(context).width >= 700;
      final large = MediaQuery.textScalerOf(context).scale(1) >= 1.5;
      Widget destination(int i) => Semantics(
        selected: i == tab,
        child: TextButton(
          onPressed: () => setState(() => tab = i),
          style: TextButton.styleFrom(
            minimumSize: const Size(48, 64),
            padding: const EdgeInsets.all(8),
            foregroundColor: i == tab
                ? const Color(0xff075E64)
                : const Color(0xff52686C),
            backgroundColor: i == tab ? const Color(0xffE8F3F1) : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(11),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icons[i]),
              Text(
                labels[i],
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: i == tab ? FontWeight.w700 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      );
      return Scaffold(
        body: SafeArea(
          child: Row(
            children: [
              if (wide)
                SizedBox(
                  width: 205,
                  child: ColoredBox(
                    color: Colors.white,
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        for (int i = 0; i < 4; i++)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: destination(i),
                          ),
                        const Text('Your routine,\nat your pace.'),
                      ],
                    ),
                  ),
                ),
              Expanded(
                child: Column(
                  children: [
                    if (s.error != null)
                      Semantics(liveRegion: true, child: Text(s.error!)),
                    Expanded(child: pages[tab]),
                  ],
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: wide
            ? null
            : SafeArea(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(8, 8, 8, 12),
                  child: LayoutBuilder(
                    builder: (context, c) => Wrap(
                      spacing: 3,
                      runSpacing: 3,
                      children: [
                        for (int i = 0; i < 4; i++)
                          SizedBox(
                            width:
                                (c.maxWidth - (large ? 3 : 9)) /
                                (large ? 2 : 4),
                            child: destination(i),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
      );
    },
  );
}
