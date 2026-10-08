# Testing

Run `python3 tool/verify.py --web` from the repository root (`python` on Windows). Python uses only its standard library. Flutter packages come from the committed lockfile. The command stops on any failed check or coverage below 60%.

## Verified results

Local validation on macOS with Flutter 3.47.5 and Dart 3.13.4:

| Check | Result |
|---|---|
| Formatting | No changes required |
| Static analysis | No issues |
| Unit tests | 2 passed |
| Widget tests | 6 passed |
| All application line coverage | 522 / 542 = **96.31%** |
| Web release build | Passed |

Coverage includes all 17 Dart files under `lib/`, with no exclusions. The report script fails if an application file is missing from LCOV. Coverage is executed-line coverage, not branch coverage. Generated files are written to `coverage/lcov.info`, `reports/coverage.html`, and `reports/coverage-summary.txt`.

The full verification command also passed in a fresh directory populated only from Git-staged files. No local build output, SDK settings, generated reports or enclosing project files were copied into that check. The copied design references were verified byte-for-byte against the original synced sources.

## What the tests check

- Medicine replacement/archive/restore, serialized persistence, reversible dose records, fixed-clock date filtering, validation and unreadable storage handling.
- Startup through the production entry point, empty states, form errors, review-before-save, medicine editing, dose Undo and later history correction.
- Symptom saving, summary date ranges and larger-text settings.
- Every core screen at 393×852 with 200% text scaling and no overflow exceptions.
- Labeled tap targets and Android minimum target sizes on the main screen.

The default widget-test viewport is 800×600, which also exercises tablet navigation. Tests use isolated mock preferences and fictional medicine data. No tests connect to a real health account or service.

## Optional phone snapshot

```sh
flutter test tool/preview_test.dart --dart-define=VISUAL_FONT=/absolute/path/to/font.ttf
```

Supply an available TrueType font on your machine. The renderer loads Material icons from Flutter's assets and writes `reports/flutter-phone.png`. It runs separately from the eight-test coverage suite and is skipped when no font path is provided. The checked-in image in `docs/images/` is the previously inspected sample, not a golden-image assertion.

GitHub CI executes the same verification command and uploads coverage and the web build. A GitHub-hosted run has not yet been executed. Native Android/iOS builds, hardware accessibility and browser interaction remain outside these automated checks.
