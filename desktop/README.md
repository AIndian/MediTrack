# MediTrack Desktop

Electron desktop implementation for SWEN 661. The app reuses the React screens, validation, persistence, dose controls, and design tokens in `../react/`. The desktop folder adds native menus, keyboard commands, a toolbar, direct navigation, medicine search, and protection for unsaved forms.

**Prototype: use sample information.** Records are stored locally without encryption. Reminders, cloud sync, caregiver access, and appointment-summary export are unavailable.

## Quick start

Clone the **whole repository**. Install Node.js **22.22.2** (the version used for verification). From the repository root:

```sh
node desktop/run.mjs start
```

The script installs locked dependencies when needed, builds the shared React interface, and opens the native desktop app. Close the window to stop it. First launch requires internet access to download dependencies and Electron; the built application works offline.

## Run all desktop tests

Install **Java 17 or newer** and make `java` available on your PATH. Close any separately running desktop preview on port 4175, then run:

```sh
node desktop/run.mjs test
```

This command restores locked dependencies and runs, in order:

1. All shared React formatting, lint, unit, component, integration, coverage, build, and Chromium E2E checks.
2. Desktop formatting, lint, native-menu unit tests, and production build.
3. Five native Electron E2E flows, including keyboard/focus checks, accessibility scans, save recovery, and persistence after restarting Electron.
4. Five Maestro flows against the same desktop renderer in Chromium, with screenshots and an HTML report.

The runner stops at the first failure and returns a nonzero exit code. Run one command at a time and close the app before testing or packaging. It downloads Playwright Chromium and the checksum-verified Maestro 2.11.0 CLI on the first test run. Maestro may also download its Chromium driver/browser. Allow several minutes and internet access for setup. Native Electron windows appear briefly while tested; profiles use isolated temporary folders, not your normal records.

This command covers the desktop implementation and its shared React dependency. The separate Flutter implementation continues to use `python tool/verify.py --web` and its existing CI workflow.

Reports after a successful run:

| Output                                | Location                                |
| ------------------------------------- | --------------------------------------- |
| Shared application coverage           | `react/coverage/index.html`             |
| Shared Chromium tests                 | `react/playwright-report/index.html`    |
| Native Electron tests and screenshots | `desktop/playwright-report/index.html`  |
| Native machine-readable results       | `desktop/reports/electron-results.json` |
| Maestro Chromium report               | `desktop/reports/maestro.html`          |
| Maestro commands and screenshots      | `desktop/reports/maestro/`              |

See [submission notes](SUBMISSION.md) and [committed screenshot evidence](evidence/README.md). Generated reports and binaries are ignored by Git; CI uploads fresh reports for each run.

## Package the app

```sh
node desktop/run.mjs package
```

On Windows x64, open `desktop/release/MediTrack-win32-x64/MediTrack.exe`. Keep the entire folder together. Recipients of that folder do not need Node or Java. This is an unsigned portable build, not an installer or an automatic updater. Windows is the verified target; macOS and Linux need their own validation and packaging.

## Keyboard and accessibility

| Shortcut                 | Action                                                 |
| ------------------------ | ------------------------------------------------------ |
| Ctrl+N                   | Add medicine                                           |
| Ctrl+Shift+L             | Log symptom                                            |
| Ctrl+F                   | Find medicine and focus search                         |
| Ctrl+S                   | Validate/review the form, then save from review        |
| Ctrl+1 through Ctrl+6    | Today, Medicines, History, Symptoms, Summary, Settings |
| F1                       | Keyboard shortcut help                                 |
| Alt or F10               | Native Windows menu bar                                |
| Tab / Shift+Tab          | Move forward/backward between controls                 |
| Escape                   | Close a dialog; keep an unsaved draft                  |
| Ctrl++ / Ctrl+- / Ctrl+0 | Native window zoom in/out/reset                        |

All commands have visible controls. Standard copy, paste, undo, and select-all use native Edit menu roles. In the Chromium preview, use Ctrl+Shift+M for Add medicine because Ctrl+N belongs to the browser. Native menus and Ctrl+1–6 are Electron features. The menu definition uses Command on macOS, but that platform has not been manually verified.

The interface provides visible focus, a skip link, semantic landmarks and headings, labeled fields and errors, status announcements, focused page headings after navigation, modal focus containment/restoration, 100–200% text scaling, forced-color styles, and reduced-motion support. Automated accessibility scans and keyboard tests do **not** replace testing with an actual screen reader; the manual procedure is in the submission notes.

## Organization and storage

```text
desktop/
  electron/              Main process, restricted preload bridge, native menus
  src/                   Desktop shell, searchable medicine list, modal and styles
  .maestro/              Five Chromium user-flow definitions
  test/unit/             Native menu contract tests
  test/e2e/              Real Electron E2E and accessibility checks
  scripts/package.cjs    Portable app packaging
  run.mjs                Start / complete desktop tests / package
  evidence/              Reviewed screenshots and verification record
  SUBMISSION.md          Grading guide, test mapping and limitations
```

The build imports shared source from `react/src/`; it does not maintain a second copy of the medicine logic. Electron loads only bundled local assets, with renderer Node access disabled, context isolation and sandbox enabled, a restrictive content policy, denied permission requests, and a narrow command bridge. The application allows one instance per user profile to avoid conflicting local writes.

Windows records live under `%APPDATA%\MediTrack Desktop`, independently of the browser and Flutter apps. `MEDITRACK_USER_DATA` can point to an isolated test profile. The app warns before closing when a form is unsaved or storage has failed. The shared recovery UI can download unreadable saved JSON before an explicit reset; do not delete the profile folder to troubleshoot real records.

For a preinstalled Maestro CLI, `MAESTRO_HOME` may point to the Maestro 2.11.0 directory containing `lib/`. Otherwise the runner manages its own ignored `desktop/.cache/` directory. Run `node desktop/run.mjs test` after dependency changes to restore both lockfiles consistently.
