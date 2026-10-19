# MediTrack React

Separate React web implementation. The Flutter app and its records are unchanged.
Use fictional sample information: browser storage is unencrypted.

Requires Node.js 22.12+ and Python 3.10+ (for the shared coverage reporter).

```sh
cd react
npm ci
npx playwright install chromium
npm run dev
```

```sh
npm run test:unit
npm run test:widget
npm run test:browser
npm run verify
```

`verify` runs tests, requires at least 60% lines, statements, branches and
functions across every JavaScript/JSX file under `src/`, builds `dist/`, then
checks real Chromium layouts on phone/tablet in portrait/landscape at 100/200%
text. Browser tests also verify minimum target sizes, input labels and local
workflows while the loaded app has no network connection.
Open `coverage/index.html` for interactive coverage; `coverage/lcov.info`
supports other reporting tools. Dependencies are pinned in `package-lock.json`.

The store mirrors Flutter's local-first operations with React's
`useSyncExternalStore`. It uses the separate key `meditrack.react.v1` and starts
empty. Corrupt or unavailable storage shows an error and is never overwritten.
Failed writes retain the in-memory records and show an error; retry the action
after storage becomes available. No server, accounts, notifications or sharing
are connected.

The unit suite ports `test/unit/app_store_test.dart` and reuses its fictional
medicine and fixed local clock. It also tests validation, failed writes, local
midnight, future-record filtering and isolation from Flutter storage.
