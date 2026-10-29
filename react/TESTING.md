# React testing and coverage

Run from `react/` with Node.js **22.22.2**, the version pinned in CI:

```sh
npm ci --engine-strict
npx --no-install playwright install chromium
npm run verify
```

On Linux CI, use `npx --no-install playwright install --with-deps chromium` to install required
browser system packages as well. `verify` runs Prettier's format check and ESLint
first and stops on a format violation, lint error or warning, failed test, coverage threshold,
build or browser check. It starts and stops a local production-preview server for
the browser checks. It requires a free port 4173.

For individual checks:

```sh
npm run format:check
npm run lint
npm run test:unit
npm run test:component
npm run test:coverage
npm run build
npm run test:e2e
```

Run the build before browser tests if you have changed the app. `npm run test:watch`
runs the unit/component tests while editing. Apply formatting with `npm run format`.
The formatter respects repository and React ignore rules, including generated output
and local environment files. Flutter code and copied references are outside its scope.

ESLint checks application code, tests and configuration with recommended JavaScript
rules and React Hooks rules for application code. Browser and Node globals are
scoped to the appropriate files. Generated builds, dependencies and reports are
excluded. Lint changes do not reformat or alter application behavior.

## Measured history preparation

A local Node.js 22.22.2 benchmark used ten fictional medicines with four daily doses
over 90 days: 3,600 saved records, filtered to a 1,200-record 30-day view. After five
warm-up calls, 30 calls to `history(30)` were timed with `performance.now()` on the
same Windows machine, alternating the before/after order. The complete ordered output had the same SHA-256 before and
after the change.

| History filtering/sorting | Before   | After   |
| ------------------------- | -------- | ------- |
| Median                    | 13.77 ms | 1.74 ms |
| 95th percentile           | 15.49 ms | 2.66 ms |

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

| Flutter source                          | React copy                                                                    | Checks                                                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `test/support/fixtures.dart`            | `test/support/fixtures.js`                                                    | Fictional medicine and local fixed clock                                                                                                  |
| `test/unit/app_store_test.dart`         | `test/unit/store.test.js`                                                     | Replacement, persistence, archive/restore, Undo, validation, date filtering, corruption protection, five text sizes and legacy preference |
| `test/widget/app_flow_test.dart`        | `test/component/app-flow.test.jsx`, `main.test.jsx`, `routes-errors.test.jsx` | Production boot, empty states, add/review/edit, dose Undo/correction, symptoms, summary ranges, unavailable routes and storage errors     |
| `test/widget/text_size_test.dart`       | `test/component/text-size.test.jsx`, `test/e2e/accessibility.spec.js`         | Five stops, toggle synchronization, persistence, keyboard slider controls and larger browser text                                         |
| `test/widget/header_clock_test.dart`    | `test/component/header-clock.test.jsx`, `test/e2e/accessibility.spec.js`      | Minute/midnight, resume, locale formatting, timer disposal and enlarged-text layout                                                       |
| Widget overflow and touch-target checks | `test/e2e/accessibility.spec.js`                                              | All ten screens at 200% on phone/tablet/desktop, horizontal overflow, 48px targets, axe checks and navigation                             |

Review regressions add shared form/store duplicate-time rules, trimmed supply,
explicit errors for blocked edits, exact raw JSON backup downloads, canceled and
confirmed resets, failed resets, inaccessible storage and changed-data protection.
`storage-notice.test.jsx` tests the shared recovery UI; `medicine-validation.test.jsx`
checks field errors before review. Browser checks download the real file and verify
that reset leaves the separate Flutter storage key unchanged.

The Undo regression is a no-expiry guard, not a latency assertion. Virtual timers
are enabled before the dose is recorded, then advanced across an idle interval;
the Undo action must remain available. Undo has no independent timeout, while
navigation or a new dose/day can replace its controls.

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

The separate `.github/workflows/react.yml` runs on every pull request, every push to
`main`, and manual runs. There are no path filters that can leave a required check
pending when only shared configuration changes. The **React verification** and
**Flutter verification** jobs have distinct check names for branch protection.

React CI installs the exact lockfile with `npm ci --engine-strict`, so unsupported
dependency engines fail the install. Named steps run the same checks as `npm run verify`:
formatting, lint, unit/component coverage, production build and browser tests. Browser
installation follows the cheaper checks and uses the locked Playwright executable.
Vitest rejects focused tests in CI; Playwright also rejects focused tests and any test
that passes only on retry. The single retry still captures failure diagnostics.

Both workflows require nonempty coverage reports and build output before succeeding.
React additionally requires the browser HTML report. Missing expected files fail the
job. Available coverage and browser diagnostics are uploaded after failures, and a
successful React build is retained even if a later browser check fails. Canceled runs
do not continue uploading artifacts. Upload errors fail the job; they are not warnings.
Actions use full commit SHAs, read-only repository permissions, bounded job timeouts,
and 14-day artifact retention. New runs cancel older runs for the same branch.

React CI uploads
`react-coverage`, `react-browser-checks`, and `meditrack-react-web` artifacts. Download
and extract the coverage artifact, then open its `index.html`. Flutter retains its
existing verification helper and coverage/build artifacts.

## Verified locally on October 27, 2026

Windows, Node.js 22.22.2, npm 10.9.7, Chromium through Playwright, with `CI=true`.
A clean `npm ci --engine-strict` completed without `EBADENGINE` warnings. The lockfile
includes the updates already merged into `main`: jsdom 30.1.3 and user-event 14.6.8.
The supported runtime range and CI baseline satisfy their engine requirements.

| Check                     | Result                                     |
| ------------------------- | ------------------------------------------ |
| Prettier                  | All matched files pass the format check    |
| ESLint                    | Passed with no errors or warnings          |
| Unit/component tests      | 50 passed across 15 files                  |
| Application line coverage | 307 / 307 = **100%**                       |
| Statement coverage        | 352 / 352 = **100%**                       |
| Function coverage         | 121 / 121 = **100%**                       |
| Branch coverage           | 244 / 252 = **96.82%**                     |
| Browser tests             | 27 passed across phone, tablet and desktop |
| Production build          | Passed                                     |

The browser checks also verify Flutter's header icon color/size and exact favicon
bytes served by the production build. The phone screenshot at 200% was inspected.
Actionlint 1.7.12 validated both workflows. Temporary failure probes confirmed nonzero
exits for focused unit tests, focused browser tests, a browser test passing only on
retry, and a strict install on unsupported Node.js 22.18.0. Those probes are not part
of the committed application suite.

Automated accessibility checks do not establish WCAG conformance. Native Flutter
builds, physical devices, VoiceOver/TalkBack and browsers other than Chromium were
not checked here. Local browser storage is unencrypted and intended for sample data
in one tab. Hosted results are available in the PR's Actions checks; local results
alone do not establish a hosted pass.
