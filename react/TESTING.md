# React testing and coverage

Run from `react/` with Node.js 22.13 or newer:

```sh
npm ci
npx playwright install chromium
npm run verify
```

On Linux CI, use `npx playwright install --with-deps chromium` to install required
browser system packages as well. `verify` runs ESLint first and stops on a lint error
or warning, failed test, coverage threshold,
build or browser check. It starts and stops a local production-preview server for
the browser checks. It requires a free port 4173.

For individual checks:

```sh
npm run lint
npm run test:unit
npm run test:component
npm run test:coverage
npm run build
npm run test:e2e
```

Run the build before browser tests if you have changed the app. `npm run test:watch`
runs the unit/component tests while editing.

ESLint checks application code, tests and configuration with recommended JavaScript
rules and React Hooks rules for application code. Browser and Node globals are
scoped to the appropriate files. Generated builds, dependencies and reports are
excluded. Lint changes do not reformat or alter application behavior.

## Measured history preparation

A local Node.js 22.18.0 benchmark used ten fictional medicines with four daily doses
over 90 days: 3,600 saved records, filtered to a 1,200-record 30-day view. After five
warm-up calls, 30 calls to `history(30)` were timed with `performance.now()` on the
same Windows machine. The complete ordered output had the same SHA-256 before and
after the change.

| History filtering/sorting | Before | After |
| --- | --- | --- |
| Median | 14.67 ms | 2.07 ms |
| 95th percentile | 16.04 ms | 2.45 ms |

The implementation computes calendar boundaries once per query and reuses one
locale comparator. It does not cache records or defer writes. A separate render
regression checks that dose changes update the controls without rendering the app
header, while text-size and clock updates still reach the header.

These figures measure data preparation, excluding rendering, storage writes,
simulated typing and browser paint. They are not a whole-app or physical-phone
latency claim, and CI does not enforce a hardware-dependent timing threshold.

## Flutter test mapping

The original tests remain under the repository's `test/` folder. The React copy
reuses the fictional medicine details and October 8 fixed clock, with isolated
browser storage. Tests assert user behavior rather than Dart/React implementation
details.

| Flutter source | React copy | Checks |
| --- | --- | --- |
| `test/support/fixtures.dart` | `test/support/fixtures.js` | Fictional medicine and local fixed clock |
| `test/unit/app_store_test.dart` | `test/unit/store.test.js` | Replacement, persistence, archive/restore, Undo, validation, date filtering, corruption protection, five text sizes and legacy preference |
| `test/widget/app_flow_test.dart` | `test/component/app-flow.test.jsx`, `main.test.jsx`, `routes-errors.test.jsx` | Production boot, empty states, add/review/edit, dose Undo/correction, symptoms, summary ranges, unavailable routes and storage errors |
| `test/widget/text_size_test.dart` | `test/component/text-size.test.jsx`, `test/e2e/accessibility.spec.js` | Five stops, toggle synchronization, persistence, keyboard slider controls and larger browser text |
| `test/widget/header_clock_test.dart` | `test/component/header-clock.test.jsx`, `test/e2e/accessibility.spec.js` | Minute/midnight, resume, locale formatting, timer disposal and enlarged-text layout |
| Widget overflow and touch-target checks | `test/e2e/accessibility.spec.js` | All ten screens at 200% on phone/tablet/desktop, horizontal overflow, 48px targets, axe checks and navigation |

Review regressions add shared form/store duplicate-time rules, trimmed supply,
explicit errors for blocked edits, exact raw JSON backup downloads, canceled and
confirmed resets, failed resets, inaccessible storage and changed-data protection.
`storage-notice.test.jsx` tests the shared recovery UI; `medicine-validation.test.jsx`
checks field errors before review. Browser checks download the real file and verify
that reset leaves the separate Flutter storage key unchanged.

The core-screen review adds HTTP-safe medicine IDs and top-level render recovery;
focus and announcements after history removal, Undo and save retry; Review retry
navigation; chronological history; upcoming/past dose labels; archived-supply handling;
and recorded counts separated from current-schedule estimates. Each product fix is
a separate commit on `react/02-core-screens`.

`test/e2e/core-review.spec.js` runs the built app on an insecure HTTP test origin
and asserts that `randomUUID` is absent while creation/reload still succeeds. It also
checks render recovery without clearing records, repeated persistence failures and
focus restoration, French date formatting, and visual/tab navigation order at 200%.

The static Flutter "No connection" notice is adapted to "Saved on this device";
the web app does not infer connectivity or imply cloud sync. Browser locale replaces
Flutter's device clock-format setting. React component tests use a DOM simulator;
actual layout, targets, keyboard navigation, reload persistence and browser Back/Forward
are checked against the built app in Chromium. Browser tests also exercise effective
250% text (125% browser base font combined with the app's 200% preference).

## Coverage reports

`npm run test:coverage` uses Vitest's V8 coverage. All fourteen application `.js`/`.jsx`
files under `src/` are included, including the production entry point, router, store
and every screen. No application JavaScript files are excluded. CSS and HTML are
checked through browser tests rather than JavaScript coverage.

Each metric has an enforced **60% minimum**: lines, statements, functions and branches.
Reports are generated locally and ignored by Git:

- `coverage/index.html`: navigable HTML source report.
- `coverage/lcov.info`: LCOV for coverage tooling.
- `coverage/coverage-summary.json`: machine-readable totals and per-file counts.
- `playwright-report/index.html`: browser test report.
- `test-results/`: inspected 200% screenshots, plus traces/screenshots on failure.

The separate `.github/workflows/react.yml` runs `npm ci` and the same verification
command on React pull requests, relevant main-branch pushes and manual runs. It uploads
`react-coverage`, `react-browser-checks`, and `meditrack-react-web` artifacts. Download
and extract the coverage artifact, then open its `index.html`. The existing Flutter
workflow and reporting helper are unchanged.

## Verified locally on October 27, 2026

Windows, Node.js 22.18.0, npm 10.9.3, Chromium through Playwright:

| Check | Result |
| --- | --- |
| ESLint | Passed with no errors or warnings |
| Unit/component tests | 50 passed across 15 files |
| Application line coverage | 296 / 296 = **100%** |
| Statement coverage | 352 / 352 = **100%** |
| Function coverage | 121 / 121 = **100%** |
| Branch coverage | 244 / 252 = **96.82%** |
| Browser tests | 24 passed across phone, tablet and desktop |
| Production build | Passed |

Automated accessibility checks do not establish WCAG conformance. Native Flutter
builds, physical devices, VoiceOver/TalkBack and browsers other than Chromium were
not checked here. Local browser storage is unencrypted and intended for sample data
in one tab. Hosted results are available in the PR's Actions checks; local results
alone do not establish a hosted pass.
