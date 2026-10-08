# Contributing

1. Use the Flutter version in `.flutter-version` and restore dependencies with `flutter pub get --enforce-lockfile`.
2. Create a branch for your change. Keep app code in the appropriate model, state, screen or shared-widget folder.
3. Add or adjust unit/widget tests when behavior changes. Keep fixtures fictional and avoid real medical records.
4. Format with `dart format lib test tool/preview_test.dart`.
5. Run `python3 tool/verify.py --web` before opening a pull request.

Do not commit build output, generated reports, local SDK paths, credentials or signing keys. Keep `pubspec.lock` committed so everyone tests the same dependencies. An intentional dependency change should update the lockfile with `flutter pub get` and rerun all checks.

Treat `docs/design/reference/` as a historical snapshot. Make Flutter changes in `lib/` and record design deviations in `docs/design/DESIGN_PARITY.md`. Keep body text scalable, controls labeled, and buttons at least 48 logical pixels high (primary actions 56).

For a pull request, describe the behavior change, the tests run, and any remaining limitations. New integrations should not imply that notifications, sharing or sync work until their actual services and permissions are connected and tested.
