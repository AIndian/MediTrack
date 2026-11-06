# Testing

Run `python3 tool/verify.py --web` from the repository root (`python` on Windows). Python uses only its standard library. Flutter packages come from the committed lockfile. The command stops on any failed check or coverage below 60%.

## Verified results

Local validation on Windows with Flutter 3.47.5, Dart 3.13.4 and Node 22.22.2 (2026-10-27):

| Check | Result |
|---|---|
| Formatting | No changes required |
| Static analysis | No issues |
| Unit tests | 4 passed |
| Widget tests | 11 passed |
| Integration tests | 10 passed |
| All application line coverage | 709 / 725 = **97.79%** |
| Web release build | Passed |

Coverage includes all 18 Dart files under `lib/`, with no exclusions. The report script fails if an application file is missing from LCOV. Coverage is executed-line coverage, not branch coverage. Generated files are written to `coverage/lcov.info`, `reports/coverage.html`, and `reports/coverage-summary.txt`.

At the initial repository setup, the full verification command also passed in a fresh directory populated only from Git-staged files. No local build output, SDK settings, generated reports or enclosing project files were copied into that check. The copied design references were verified byte-for-byte against the original synced sources.

## What the tests check

- Medicine replacement/archive/restore, serialized persistence, reversible dose records, fixed-clock date filtering, validation and unreadable storage handling.
- Startup through the production entry point, empty states, form errors, review-before-save, medicine editing, dose Undo and later history correction.
- Symptom saving, summary date ranges and larger-text settings.
- Every core screen at 393×852 with 200% text scaling and no overflow exceptions.
- Live header time: minute/midnight updates, app resume, 12/24-hour formatting, safe timer disposal, and top-right placement with Back navigation at 200% text.
- Text-size slider: all five stops, quick-toggle synchronization, saved preferences, legacy preference migration, and respect for larger system text.
- Short connection notice on Today.
- Labeled tap targets and Android minimum target sizes on the main screen.

The default widget-test viewport is 800×600, which also exercises tablet navigation. Tests use isolated mock preferences and fictional medicine data. No tests connect to a real health account or service.

## Optional phone snapshot

```sh
flutter test tool/preview_test.dart --dart-define=VISUAL_FONT=/absolute/path/to/font.ttf
```

Supply an available TrueType font on your machine. The renderer loads Material icons from Flutter's assets and writes `reports/flutter-phone.png`. It runs separately from the main coverage suite and is skipped when no font path is provided. The checked-in image in `docs/images/` is the previously inspected sample, not a golden-image assertion.

GitHub CI executes the same verification command and uploads coverage and the web build. See [GitHub Actions](https://github.com/AIndian/MediTrack/actions/workflows/ci.yml) for results on each pushed commit. Native Android/iOS builds and hardware accessibility remain outside these automated checks. Browser interaction is covered by the suites below.

## WCAG integration and end-to-end checks

The [complete WCAG 2.1 AA checklist](WCAG-2.1-AA.md) maps all 50 A/AA criteria to React and Dart evidence. Every criterion has an individual commit; criteria already supported or not applicable have evidence-only commits. Integration and E2E additions follow the criterion commits; pull request preparation preserves the newer mainline React implementation.

From `react/`:

```sh
npm ci
npx playwright install chromium
npm run verify
npm run test:integration
```

React verification runs 53 unit/component/integration tests, enforces coverage, checks the report tooling, builds the release and runs 39 Chromium E2E tests across phone, tablet and desktop projects. Browser checks cover all routes with enlarged text on phone/tablet/desktop, 320px reflow, WCAG spacing overrides, axe A/AA rule tags, error recovery, a complete keyboard medicine/dose/history process, pointer cancellation, forced-color focus and local persistence. Axe checks are automation evidence, not conformance certification.

From the repository root, run Flutter analysis, all 25 unit/widget/integration tests, coverage and the production web build:

```sh
python tool/verify.py --web
```

Then exercise the compiled Flutter application, its real web preferences plugin and browser semantics:

```sh
cd react
npm run test:e2e:flutter
```

The Flutter E2E suite contains three complete-process viewport cases (320x1024, 1280x256 and 852x393) and a separate keyboard-only add/review/save process. It checks real review data, archive/restore, dose Undo/history correction, symptom persistence after reload, language, zoom allowance, 200% text, page titles and accessible roles/names. The full-process cases combine pointer activation, scrolling and keyboard field entry; they do not certify a complete screen-reader interaction sequence. The separate Flutter widget integration matrix covers ten screens at four viewport sizes and both text scales, plus navigation and storage errors. Widget integrations use production app/store code with mock preferences; E2E uses real browser storage. A failed persistence guard is simulated in the Flutter integration suite; actual quota failures are covered in the React tests.

CI's Flutter browser job downloads the web build from the verification job and runs the same E2E command. React and Flutter browser reports use separate directories and fresh local servers, so an unrelated running preview cannot satisfy these checks. Reports and traces are uploaded as CI artifacts; CI itself has not been executed by this local run.

Human release checks remain open in the checklist: NVDA, VoiceOver, TalkBack, external keyboard/switch input, real device rotation, OS contrast/text settings, canvas text-spacing equivalence, 400% browser zoom, and focus/announcement behavior throughout complete processes. Browser semantic keyboard focus after long scrolls and route returns especially needs review on the pinned Flutter engine. Neither code review, line coverage nor automated scans establish full WCAG conformance.
