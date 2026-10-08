# Architecture

The app uses Flutter's built-in `ChangeNotifier`, `ListenableBuilder`, and `Navigator`. There is no server or account requirement.

`main.dart` loads shared preferences and constructs `AppStore`. `app.dart` configures the theme and system-compatible text scaling, and opens `Home`. The navigation shell selects one of four primary destinations; detail pages use standard Navigator routes and a Back control.

Screens read state and call store methods. The store serializes medicine records, date-specific dose statuses, symptoms and text settings into `meditrack.v1` in shared preferences. Writes are queued in order; UI changes notify listeners immediately. An error is shown if a read or write fails. Tests supply mock preferences and a fixed clock.

| Screen | Source |
|---|---|
| Today | `lib/screens/today_screen.dart` |
| Medicines | `lib/screens/medicines_screen.dart` |
| Medicine details | `lib/screens/medicine_details_screen.dart` |
| Add/edit medicine | `lib/screens/medicine_form_screen.dart` |
| Review medicine | `lib/screens/medicine_review_screen.dart` |
| Medication reminder | `lib/screens/dose_screen.dart` |
| Dose history | `lib/screens/history_screen.dart` |
| Symptoms | `lib/screens/symptoms_screen.dart` |
| Appointment summary | `lib/screens/summary_screen.dart` |
| Settings & sharing | `lib/screens/settings_screen.dart` |

`lib/widgets/design_widgets.dart` holds the shared page layout, cards, badges and medicine heading. `lib/widgets/dose_controls.dart` provides Taken/Skip and persistent Undo behavior in Today and reminder screens. Navigation is in `lib/screens/home_shell.dart`; the medicine model is separate from persistence in `lib/models/medicine.dart`.

The HTML reference takes precedence where its colors differ from the JSON design tokens. Keep UI refinements in shared components where possible; document intentional differences in the design mapping. The refactor into separate files is organizational and retains the existing app behavior.
