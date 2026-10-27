# MediTrack for React

A separate browser implementation of the existing Flutter prototype. Flutter sources,
tests, platform projects and design references remain in place. React uses its own
`meditrack.react.v1` browser-storage key; it does not read or migrate Flutter records.

Use Node.js 22.12 or newer. From this directory:

```sh
npm ci
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

Prototype only: use sample information. Browser storage is unencrypted. Notifications,
cloud sync, external sharing and caregiver access are unavailable. Multiple simultaneous
tabs are not supported; use one tab to avoid competing writes. Offline-capable storage
does not mean the app shell is installable or available offline after a fresh reload.
