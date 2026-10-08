# MediTrack design validation

Checked October 6, 2026. These results apply to the local design handoff and browser preview. They do not establish a native Figma file or native mobile accessibility compliance.

| Check | Evidence and result |
|---|---|
| Screen scope | 10 unique main screens, 34 documented secondary states in screens.json. |
| Palette | 198 approved text/UI uses pass the assigned thresholds. All 136 unique color pairs independently checked using the WebAIM public API; no failed requests. Timestamped raw results are in webaim-verification.json. |
| Typography | All 10 styles are at least 16 logical units with at least 1.5 times line height. |
| Component specification | 21 component types and 26 icon descriptions. Required interaction states, sizing, spacing, and names documented. |
| Responsive geometry | Checked every main screen across four device profiles, two orientations, and two text sizes: 160 combinations. No horizontal overflow in app content or app viewport. Visible app controls met 48 by 48 logical units; checkbox/radio measurements use their tappable labels. |
| Alternate views | 10 dark-mode and 10 grayscale-wireframe screen checks passed without horizontal content overflow. |
| Visual review | Inspected phone at normal and enlarged text, fitted tablet dark mode, component specimens, and a phone dark-mode dialog at 200%. Wide frames fit the preview area; the caption shows the presentation scale. |
| Dose workflow | Mark Taken updates the dose and recorded total; Undo restores the previous state. Amlodipine history correction changes Amlodipine while preserving the Metformin state. |
| Symptom entry | A changed symptom name, severity, time, and note appear in the saved demonstration record. |
| Keyboard behavior | A settings toggle retains focus after re-rendering. Invalid medication submission focuses an error summary; its link focuses the missing input. The link has a 51-unit target height at normal text. Corrected form proceeds to Review medicine. |
| Dialog behavior | Dark theme and 200% text propagate into the dialog. At the 393-unit phone size the dialog is 361 units wide, with vertical scrolling and no horizontal overflow. Permissions review includes viewing, missed-dose alerts, schedule changes, and calendar state. |
| Browser diagnostics | No browser console errors observed during the reviewed flows; inline script syntax checked. |

## Evidence boundaries

The 160 configurations are interactive preview states, not 160 saved Figma frames. Geometry checks are not a complete visual or assistive-technology audit. The entire set was not individually screenshot-reviewed. The view is fitted to the available desktop panel for presentation; logical target sizes remain the design measurements.

Figma AI generation, native component sets, reusable instances, Auto Layout behavior, variables, and a saved Figma URL remain pending Figma access. Native VoiceOver/TalkBack, external keyboards on tablets, OS text scaling at intermediate sizes, notification delivery, persistence, synchronization, exports, and caregiver access require implementation and device testing. Preview buttons that demonstrate a native service explain that boundary and do not operate that service.

The final submission should retain actual Figma AI explorations, inspect every saved frame at its intended size, and repeat contrast checks for any changed color combination. Use Figma AI prompts.md for the remaining workflow.
