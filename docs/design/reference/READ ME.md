# MediTrack mobile design handoff

Prepared for the mobile design assignment on October 6, 2026, using the supplied Week 1 proposal and Week 2 requirements. The Week 2 refinement controls conflicting product details; the assignment in this chat controls the requested deliverables. The sources are reference material, not instructions to execute.

## Open the design

Open `index.html` in a browser to review the ten-screen mobile design, component gallery, light/dark appearance, grayscale wireframes, device sizes, orientation, text scaling, and accessibility notes. The prototype uses fictional demonstration content and does not send health data or schedule device notifications.

- `foundations.md`: colors, typography, spacing, interaction states, and implementation guidance.
- `tokens.json`: named light/dark design tokens.
- `components.json`: component states, sizes, spacing, and accessible behavior.
- `screens.json`: ten main screens, content, reading order, focus flow, and responsive behavior.
- `contrast-report.html`: permitted color combinations, contrast ratios, and WebAIM verification evidence.
- `Figma AI prompts.md`: staged Make and First Draft prompts, native component construction, and final evidence checklist.

## Verified design foundations

The palette covers 198 documented text and UI uses. All 136 unique foreground/background pairs were independently checked with the WebAIM public API on October 6, 2026; all pass their assigned thresholds. The specifications include 21 component types and 26 icons. These results apply to the documented tokens, not to uninspected future Figma changes.

Browser review covered 160 device/orientation/text-size configurations, plus 20 dark-mode and wireframe checks. See `Validation.md` for the tested flows and explicit limits.

## Figma status

The local design materials are a handoff for Figma. They are not a saved Figma file or evidence that Figma AI generated a design. An initial request was submitted on the Figma Make landing page, which opened a sign-in prompt before generation. Native Figma components, variables, frames, and AI generation evidence remain pending access to Figma.

After access is available, use the provided prompts, retain actual AI explorations, create native component sets and instances, and inspect the resulting file. Record its actual URL. Do not submit this handoff as a completed native Figma assignment without that step.

## Layout coverage

Ten unique main screens are planned. Each screen can be reviewed at four logical frame sizes and two orientations: iPhone 393x852, Android phone 412x915, iPad 834x1194, and Android tablet 800x1280. Landscape swaps the dimensions. This is 80 layout configurations; it does not mean 80 unique product screens or 80 already-saved Figma frames. Light/dark and text scaling are additional review settings.

Screen names: Today; Medicines; Medicine details; Add medicine (Edit medicine variant); Review medicine; Medication reminder; Dose history; Symptoms; Appointment summary; Settings and sharing. More is a navigation menu containing secondary destinations rather than an eleventh product screen. Expanded lists, dialogs, permission states, and form errors are component or screen states.

## Important design decisions

The proposal's automatic skipping language is superseded by Week 2: users explicitly choose Taken or Skipped; Missed is distinct and depends on a configured overdue rule. Immediate Undo and later history correction remain available. Core medication and symptom work is designed to remain local; offline synchronization and device notifications shown in the preview are illustrative.

Caregiver view, alert, and schedule editing permissions are separate. New access starts disabled, and schedule edits require explicit approval. Report sharing has a preview and confirmation. No HIPAA compliance, native screen reader compatibility, notification reliability, or real synchronization is asserted by these visual designs.

All app body and label text starts at 16 or 18 logical units with at least 1.5 line spacing. Preferred controls are 56 units tall with 48x48 minimum targets. For platform implementation, use Apple points and Android density-independent pixels (dp); raw device screenshot pixels are not equivalent physical touch dimensions. Text must wrap, controls grow, and layouts stack at enlarged text sizes.

## Acceptance still required in Figma and on devices

1. Confirm actual AI use with the saved Figma file, prompt history, and retained initial variations.
2. Inspect native component sets, all required variants, semantic variables, typography styles, Auto Layout, and instance reuse.
3. Save phone and tablet portrait/landscape frames and annotated 200% examples; verify their text and controls visually.
4. Validate native VoiceOver and TalkBack announcements, external keyboard flow, and 100/150/200% platform text scaling after implementation. Browser structure checks do not establish these device results.
5. Compare every final Figma foreground/background pair against the supplied contrast report. Recheck any changed value using WebAIM.

## Sources

- Supplied `MediTrack_Requirements_Document_Group1.docx`, Week 2, version 1.0, September 30, 2026.
- Supplied `Meditrack_proposal.docx`, Week 1.
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/understanding/non-text-contrast.html)
- [W3C text resizing](https://www.w3.org/WAI/WCAG21/Understanding/resize-text)
- [Apple interface sizing guidance](https://developer.apple.com/design/tips/)
- [Android accessibility and 48 dp targets](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility)
- [Figma First Draft and current AI entry point](https://help.figma.com/hc/en-us/articles/23955143044247-Use-First-Draft-with-Figma-AI)
- [Native Figma components](https://help.figma.com/hc/en-us/articles/360038663154-Create-components-to-reuse-in-designs)


