# MediTrack Desktop submission

SWEN 661 · Group 1 · Electron desktop implementation

## Implementation

MediTrack now has a separate desktop implementation in `desktop/`. It retains the original teal palette, readable cards, medicine review step, dose controls, symptoms, and appointment summary. The shared React screens and store supply the existing validation and persistence behavior. Desktop-specific additions provide a native menu bar, visible toolbar, six navigation destinations, medicine search, keyboard shortcuts, and unsaved-draft protection.

The Electron application loads a local production build and saves records in its own device profile. Medicine persistence is tested by closing Electron and reopening it with the same test profile. The app remains a coursework prototype; sample records are used throughout the evidence.

## Reproduce the submission

Install Node.js 22.22.2 and Java 17+, clone the complete repository, and run these commands from its root:

```sh
node desktop/run.mjs test
node desktop/run.mjs start
```

Use `node desktop/run.mjs package` to produce the portable application. The desktop GitHub workflow repeats the checks on Windows and uploads the test reports and packaged application. The existing React and Flutter workflows remain in place.

## E2E tests (15% requirement)

**Maestro** is the selected framework. Five flows exercise the production desktop renderer in Chromium. Playwright supplements these flows inside the actual Electron application because browser tests cannot verify Electron startup, native menu callbacks, renderer isolation, or the desktop profile across process restarts.

| Critical flow                  | Maestro definition                                                    | Native Electron verification                                                                                 |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Add and review a medicine      | `01-medicine.yaml`: required fields, review, saved details            | Ctrl+N/Ctrl+S, error focus, save, restart, find the saved medicine                                           |
| Record and correct a dose      | `02-dose-history.yaml`: Taken, Undo, Skip, history correction         | Confirm the corrected record survives reload                                                                 |
| Log a symptom                  | `03-symptom.yaml`: name, severity, notes, saved record                | Keyboard submission, saved record, summary and reload                                                        |
| Prepare an appointment summary | `04-summary.yaml`: recorded totals, medicine, 7/30-day range          | Confirm actual recorded dose and symptom data reach the summary                                              |
| Accessible desktop navigation  | `05-accessibility.yaml`: search, shortcut help, 200% text, navigation | Focus order, modal containment/restoration, Escape, forced colors, text reflow, semantic accessibility scans |

Native flow 4 additionally checks the unsaved-draft dialog, keeping a draft when the window is closed or reloaded, explicit discard on reload, and recovery from a simulated storage failure without losing a separate new draft. Flow 5 verifies that the reset confirmation identifies the desktop records and that canceling preserves them. There are five native Electron flows and two native-menu unit tests. All shared React tests also run through the quick script.

Screenshots are captured during execution, not generated mockups. [Evidence and measured results](evidence/README.md) distinguish Maestro Chromium screenshots from native Electron renderer screenshots. Renderer screenshots do not include the operating system title bar or menu bar; menu definitions and callbacks are checked separately.

## Accessibility-focused verification

The native tests use accessible names and roles to locate controls, assert focus after validation and navigation, exercise Tab/Shift+Tab/Escape in the shortcut dialog, and check that 200% text does not create horizontal page overflow. Axe scans cover validation, review, history, symptoms, summary, draft confirmation, shortcut help, and large text. Forced colors and reduced motion are emulated for a screenshot.

These checks verify accessibility semantics and keyboard interaction. They do not establish that speech output works with NVDA, Narrator, or VoiceOver. No actual screen-reader session has been recorded for this submission.

### Manual screen-reader acceptance procedure — pending

On Windows, start Narrator or NVDA and then open the packaged app with a disposable sample profile.

1. Reach the skip link using Tab and activate it. Confirm the main landmark and Today heading are announced.
2. Use the native File menu or Ctrl+N. Submit an empty form with Ctrl+S. Confirm the Medicine name label, invalid state, and associated error are announced.
3. Enter sample medicine details using the keyboard, review with Ctrl+S, and save with Ctrl+S. Confirm the new page heading is announced and the medicine remains after restarting.
4. Open F1 help. Confirm its dialog name is announced, Tab stays within it, and Escape restores focus. Repeat with an unsaved draft and choose Keep working.
5. Switch to 200% text, navigate all six destinations, record a dose and symptom, and confirm status messages, labels, summary totals, and menus can be understood without seeing the screen.

Record the screen reader/version, Windows version, actual announcements, pass/fail for each step, and any defects before claiming manual screen-reader compatibility.

## Limits

- Windows x64 is the tested desktop target. Native OS shortcut delivery, actual screen-reader speech, macOS, Linux, installer signing, and automatic updates need additional verification.
- Native menu callbacks and their accelerator definitions are tested; synthetic renderer key presses do not prove every physical OS shortcut combination.
- Local storage is unencrypted and is separate from the web and Flutter profiles. Use fictional information. There is no account login, cloud sync, reminder delivery, caregiver sharing, summary export, or cross-device migration.
- Summary schedule estimates describe the current schedule over the selected range; they are not a historical adherence percentage or medical advice.
- The desktop test command includes shared React tests. Flutter tests run independently in the repository's existing workflow.
