import 'dart:async';

import 'package:flutter/material.dart';

/// Device-local time, formatted using the user's 12/24-hour preference.
class HeaderClock extends StatefulWidget {
  final DateTime Function()? now;
  const HeaderClock({super.key, this.now});

  @override
  State<HeaderClock> createState() => _HeaderClockState();
}

class _HeaderClockState extends State<HeaderClock> with WidgetsBindingObserver {
  late TimeOfDay _time;
  late final Timer _timer;

  TimeOfDay _readTime() =>
      TimeOfDay.fromDateTime(widget.now?.call() ?? DateTime.now());

  @override
  void initState() {
    super.initState();
    _time = _readTime();
    WidgetsBinding.instance.addObserver(this);
    // Poll across minute boundaries and device-clock changes, but only rebuild
    // when the displayed minute changes. This does not rebuild screen content.
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _refresh());
  }

  void _refresh() {
    final time = _readTime();
    if (time != _time) {
      setState(() => _time = time);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _refresh();
    }
  }

  @override
  void dispose() {
    _timer.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formatted = MaterialLocalizations.of(context).formatTimeOfDay(
      _time,
      alwaysUse24HourFormat: MediaQuery.alwaysUse24HourFormatOf(context),
    );
    // Readable on demand without announcing every minute to screen readers.
    return Semantics(
      label: 'Current time: $formatted',
      excludeSemantics: true,
      child: Text(
        formatted,
        textAlign: TextAlign.right,
        style: const TextStyle(
          fontSize: 16,
          height: 1.5,
          fontWeight: FontWeight.w600,
          color: Color(0xff075E64),
        ),
      ),
    );
  }
}
