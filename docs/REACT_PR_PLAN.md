# React implementation: small PR sequence

Three local branches contain one implementation commit each, stacked in this
order. Existing Flutter application code, tests, design references and workflow
are retained. Nothing has been pushed or published.

| PR | Local branch | Review scope | Validation at that step |
|---|---|---|---|
| 1 | `react/01-foundation` | Isolated React package, local store, model validation, ported unit fixtures/tests, minimal startup | 18 tests, 97.77% line coverage, production build |
| 2 | `react/02-core-screens` | Ten screens, add/edit review flow, hash navigation, shared components, scalable styling, component/browser test copies | 36 tests, 100% line coverage, 9 browser tests, production build |
| 3 | `react/03-coverage-ci` | Reuse existing LCOV helper for React, regression check for both targets, separate CI, docs | Full `npm run verify`; 60% minimum on every coverage metric |

Each branch includes its predecessors. Compare PR 2 against PR 1 and PR 3
against PR 2 to review just that step. The final branch contains the complete
React implementation. Lockfiles account for most of PR 1's line count.

## Publish one PR at a time

Run these commands from the repository root. First publish only the foundation:

```sh
git push -u origin react/01-foundation
```

Open a PR from `react/01-foundation` into `main`.

**Title:** Add isolated React foundation and store unit tests

**Description:** Adds a separate React package and local-first store without
changing Flutter. Ports persistence, archive/restore, reversible dose records,
date filtering, text-size preferences and corrupt-storage protection into
React unit tests. Validation: 18 passing tests, 97.77% application line coverage,
production build.

After PR 1 is merged, create the next publishing branch from the updated main
and apply only the second commit. This works even if PR 1 was squash-merged:

```sh
git fetch origin
git switch -c react/02-core-screens-pr origin/main
git cherry-pick react/02-core-screens
git push -u origin react/02-core-screens-pr
```

Open a PR from `react/02-core-screens-pr` into `main`.

**Title:** Add React core screens, navigation and accessibility tests

**Description:** Implements the ten existing MediTrack screens using shared
React components, existing design values and local store operations. Includes
review-before-save, medicine editing/archive/restore, dose Undo/history
correction, symptom logging, summary ranges and text scaling. Validation:
36 passing unit/component tests, 100% application line coverage, 88 browser
layout checks plus offline/persistence workflow, production build.

After PR 2 is merged, repeat for the reporting/CI commit:

```sh
git fetch origin
git switch -c react/03-coverage-ci-pr origin/main
git cherry-pick react/03-coverage-ci
git push -u origin react/03-coverage-ci-pr
```

Open a PR from `react/03-coverage-ci-pr` into `main`.

**Title:** Reuse coverage reporting and add React CI

**Description:** Extends the existing LCOV report helper with an optional React
target and keeps Flutter as the default. Adds synthetic regression checks for
both paths, a separate React workflow and setup/parity/testing documentation.
Validation: full React verification passes; all coverage metrics exceed the
60% floor. Flutter application sources and tests remain unchanged.

Before pushing PRs 2 and 3, run their verification from `react/`:

```sh
npm ci
npx playwright install chromium
npm run verify
```

For PR 1, `npm ci` and `npm run verify` suffice. Preserve the three original
local branch tips until all commits have been applied; the cherry-pick commands
above select each tip's single commit. Do not merge the final branch wholesale
if the goal is three incremental PRs.
