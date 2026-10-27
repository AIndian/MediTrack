# MediTrack for React

A separate browser implementation of the existing Flutter prototype. Flutter sources,
tests, platform projects and design references remain in place. React uses its own
`meditrack.react.v1` browser-storage key; it does not read or migrate Flutter records.

Use Node.js 22.13 or newer. From this directory:

```sh
npm ci
npm run lint
npm run dev
npm test
npm run build
```

Open the local URL printed by Vite. The first PR supplies the state/persistence layer
and a small startup page. The next PR adds the ten core screens and navigation; the
third expands the ported unit/component tests and adds coverage enforcement and CI.

The store ports medicine replacement, archive/restore, daily dose records, Undo,
symptoms, date filters and five persisted text sizes from `lib/state/app_store.dart`.
It validates saved records, protects unreadable data from overwrite, and retains
in-memory changes with a retry action when persistence fails. Dates use the browser's
local calendar. Date ranges exclude future records.

Form and store validation share the daily-time and supply rules. Duplicate times are
rejected after trimming; supply input accepts surrounding whitespace. A read-only
store throws an explicit error if a caller attempts to edit it. A failed storage
write returns `false`, keeps the changes in memory and shows the retry action.

If one saved record is invalid, the recovery notice offers **Download saved JSON**
and **Reset saved data**. The download preserves the exact original text, including
invalid entries. Reset requires confirmation and removes only `meditrack.react.v1`;
canceling or a storage failure preserves the original. If another tab changed the
saved data, reload before resetting. When storage cannot be read at all, recovery
controls stay disabled until access is restored. Download the backup before reset;
reset cannot restore the deleted records.

`.github/dependabot.yml` schedules weekly npm and GitHub Actions update PRs once
merged into the repository's default branch; exact versions remain committed.
The existing root `analysis_options.yaml` and Flutter CI check Dart with
`flutter analyze`. React uses `eslint.config.js` with recommended JavaScript and
React Hooks rules across application code, and JavaScript checks across tests and
configuration. Generated builds, reports and dependencies are ignored. Run
`npm run lint`; any error or warning fails the command.
The foundation PR runs lint, React tests and build in `.github/workflows/react.yml`;
the third PR expands that workflow with coverage and browser checks.

Prototype only: use sample information. Browser storage is unencrypted. Notifications,
cloud sync, external sharing and caregiver access are unavailable. Multiple simultaneous
tabs are not supported; use one tab to avoid competing writes. Offline-capable storage
does not mean the app shell is installable or available offline after a fresh reload.
