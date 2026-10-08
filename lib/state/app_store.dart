import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/medicine.dart';

class AppStore extends ChangeNotifier {
  final SharedPreferences prefs;
  final DateTime Function() now;
  List<Medicine> medicines = [];
  Map<String, String> doses = {};
  List<Map<String, dynamic>> symptoms = [];
  double textScale = 1.0;
  bool get largeText => textScale > 1.0;
  static const textScales = [1.0, 1.25, 1.5, 1.75, 2.0];
  String? error;
  Future<void> pending = Future.value();
  AppStore(this.prefs, {DateTime Function()? clock})
    : now = clock ?? DateTime.now {
    try {
      final raw = prefs.getString('meditrack.v1');
      if (raw != null) {
        final j = jsonDecode(raw);
        medicines = (j['medicines'] as List)
            .map((m) => Medicine.fromJson(m))
            .toList();
        doses = Map<String, String>.from(j['doses']);
        symptoms = List<Map<String, dynamic>>.from(j['symptoms']);
        final savedScale =
            j['textScale'] ?? (j['largeText'] == true ? 2.0 : 1.0);
        if (savedScale is num && textScales.contains(savedScale.toDouble())) {
          textScale = savedScale.toDouble();
        }
      }
    } catch (_) {
      error = 'Could not load data. Restart the app.';
    }
  }
  String get day => now().toIso8601String().substring(0, 10);
  String doseKey(Medicine m, String time) => '$day|${m.id}|$time';
  List<Medicine> get active => medicines.where((m) => !m.archived).toList();
  String status(String key) => doses[key] ?? 'Due';
  void save() {
    if (error != null) {
      notifyListeners();
      return;
    }
    final encoded = jsonEncode({
      'medicines': medicines.map((m) => m.toJson()).toList(),
      'doses': doses,
      'symptoms': symptoms,
      'largeText': largeText,
      'textScale': textScale,
    });
    pending = pending.then((_) async {
      try {
        if (!await prefs.setString('meditrack.v1', encoded)) {
          throw StateError('write');
        }
      } catch (_) {
        error = 'Could not save. Keep the app open.';
        notifyListeners();
      }
    });
    notifyListeners();
  }

  void put(Medicine medicine) {
    final i = medicines.indexWhere((m) => m.id == medicine.id);
    if (i < 0) {
      medicines.add(medicine);
    } else {
      medicines[i] = medicine;
    }
    save();
  }

  void archive(Medicine m) => put(
    Medicine(
      id: m.id,
      name: m.name,
      strength: m.strength,
      instructions: m.instructions,
      times: m.times,
      supply: m.supply,
      archived: !m.archived,
    ),
  );
  void record(String key, String value) {
    if (!['Due', 'Taken', 'Skipped'].contains(value)) {
      throw ArgumentError(value);
    }
    if (value == 'Due') {
      doses.remove(key);
    } else {
      doses[key] = value;
    }
    save();
  }

  void symptom(String name, String severity, String notes) {
    if (name.trim().isEmpty) {
      throw ArgumentError('Symptom is required');
    }
    symptoms.insert(0, {
      'name': name.trim(),
      'severity': severity,
      'notes': notes.trim(),
      'date': now().toIso8601String(),
    });
    save();
  }

  void setLargeText(bool value) => setTextScale(value ? 2.0 : 1.0);

  void setTextScale(double value) {
    if (!textScales.contains(value)) {
      throw ArgumentError.value(
        value,
        'textScale',
        'Choose 100% to 200% in 25% steps',
      );
    }
    textScale = value;
    save();
  }

  List<MapEntry<String, String>> history(int days) {
    final cutoff = DateTime(
      now().year,
      now().month,
      now().day,
    ).subtract(Duration(days: days - 1));
    return doses.entries
        .where((e) => !DateTime.parse(e.key.split('|').first).isBefore(cutoff))
        .toList()
      ..sort((a, b) => b.key.compareTo(a.key));
  }

  String doseLabel(String key) {
    final parts = key.split('|');
    final matches = medicines.where((m) => m.id == parts[1]);
    return '${matches.isEmpty ? 'Removed medicine' : matches.first.name} • ${parts[0]} • ${parts[2]}';
  }
}
