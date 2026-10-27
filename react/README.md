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

Open the local URL printed by Vite. Start with **Add medicine**, enter sample details,
then review and save. Today supports Taken, Skip and Undo; History supports corrections.
More opens symptoms, appointment summaries and text-size settings. Hash URLs support
browser Back/Forward and direct links without server rewrite rules.

History shows recent days first, then times in chronological order and medicine
names alphabetically. Clearing an entry with Due offers **Undo last removal** and
moves keyboard focus to that action. Successful storage retries announce confirmation;
a pending Review save continues to medicine details when the retry succeeds.

Today localizes its date using your browser preference. Past unrecorded slots say
**Not recorded yet**; **Next dose** is reserved for an upcoming slot. Appointment
summaries show Taken/Skipped counts separately from a clearly labeled estimate of
scheduled doses. That estimate applies the current active routine throughout the
selected range; historical schedule changes and medicine start dates are not tracked.

Medicine creation supports plain-HTTP phone/LAN testing by using random bytes when
the browser's UUID API is unavailable. A top-level render-error boundary offers a
return to Today without clearing stored records. Unsaved form details may need to
be entered again after a render error.

| Core screen | Route | Source |
| --- | --- | --- |
| Today | `#/` | `src/screens/Today.jsx` |
| Your medicines | `#/medicines` | `src/screens/Medicines.jsx` |
| Medicine details | `#/medicines/:id` | `src/screens/Medicines.jsx` |
| Add/edit medicine | `#/medicines/new`, `#/medicines/:id/edit` | `src/screens/MedicineFlow.jsx` |
| Review medicine | `#/medicines/review` | `src/screens/MedicineFlow.jsx` |
| Dose details | `#/dose/:id/:time` | `src/screens/Doses.jsx` |
| Dose history | `#/history` | `src/screens/Doses.jsx` |
| Symptoms | `#/symptoms` | `src/screens/More.jsx` |
| Appointment summary | `#/summary` | `src/screens/More.jsx` |
| Settings & sharing | `#/settings` | `src/screens/More.jsx` |

React Context supplies one external store, subscribed through `useSyncExternalStore`.
React Router supplies routes; components have no separate copies of saved records.
Draft medicine details stay in navigation state until explicitly saved. The shared
page focuses its heading after navigation and sets the document title. Forms use
visible labels, linked error messages and first-error focus. Buttons have at least
48px targets (primary actions 56px), and the layout reflows at enlarged text sizes.
Phone navigation appears above content so its visual, reading and keyboard order
agree; wider screens retain the navigation rail.
The live clock follows browser locale, refreshes on resume and updates the schedule
at midnight. It is readable by screen readers without announcing every minute.

The palette, cards and typography follow `docs/design/reference/index.html` and the
Flutter app's documented adaptations. This is a responsive React web implementation,
not React Native. It does not change or merge the separate teammate React Native PRs.

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
