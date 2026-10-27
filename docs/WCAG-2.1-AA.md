# WCAG 2.1 Level AA checklist

Scope: all screens and complete medicine, dose, history, symptom, summary and settings processes in `react/src/` and `lib/`, including the React and Flutter web hosts. Baseline: `8c267ef`. Assessment date: 2026-10-27.

Source: [W3C WCAG 2.1 Recommendation](https://www.w3.org/TR/WCAG21/). Level AA includes every A and AA criterion below. Each criterion has its own `a11y(SC)` commit covering both implementations; existing behavior and non-applicability receive evidence-only commits. No unnecessary feature is added for absent media, sensors, authentication or personal-profile fields.

`[x]` means the implementation was addressed or its non-applicability was recorded through source review. It is **not** a conformance certification or a claim that every manual check passed. Automated evidence, execution results and outstanding human checks appear below. `N/A` applies only to the current feature set and must be reconsidered when it changes. Criterion 4.1.1 is retained for the original 2.1 checklist although the current Recommendation treats it as always satisfied.

| SC | Checkpoint | Level | React implementation / evidence | Dart implementation / evidence | Verification |
|---|---|---|---|---|---|
| 1.1.1 | Non-text Content | A | [x] Decorative SVG/brand icons hidden; controls have text. | [x] Decorative medication icon explicitly excluded; controls use text. | Inspect accessible names; labeled-target tests. |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | A | [x] N/A: no prerecorded audio or video. | [x] N/A: no prerecorded audio or video. | Source review: no media players, assets or streams in application screens. |
| 1.2.2 | Captions (Prerecorded) | A | [x] N/A: no synchronized prerecorded media. | [x] N/A: no synchronized prerecorded media. | Source review: no media players, assets or streams in application screens. |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | A | [x] N/A: no prerecorded video. | [x] N/A: no prerecorded video. | Source review: no media players, assets or streams in application screens. |
| 1.2.4 | Captions (Live) | AA | [x] N/A: no live audio/video streams. | [x] N/A: no live audio/video streams. | Source review: no media players, assets or streams in application screens. |
| 1.2.5 | Audio Description (Prerecorded) | AA | [x] N/A: no prerecorded video needing descriptions. | [x] N/A: no prerecorded video needing descriptions. | Source review: no media players, assets or streams in application screens. |
| 1.3.1 | Info and Relationships | A | [x] Native main/nav, heading hierarchy, labels and named card regions. | [x] Heading levels distinguish page/section; history entries and instructions are headings. | DOM/semantics integration checks; manual heading navigation pending. |
| 1.3.2 | Meaningful Sequence | A | [ ] Pending | [ ] Pending | Pending |
| 1.3.3 | Sensory Characteristics | A | [ ] Pending | [ ] Pending | Pending |
| 1.3.4 | Orientation | AA | [ ] Pending | [ ] Pending | Pending |
| 1.3.5 | Identify Input Purpose | AA | [ ] Pending | [ ] Pending | Pending |
| 1.4.1 | Use of Color | A | [ ] Pending | [ ] Pending | Pending |
| 1.4.2 | Audio Control | A | [ ] Pending | [ ] Pending | Pending |
| 1.4.3 | Contrast (Minimum) | AA | [ ] Pending | [ ] Pending | Pending |
| 1.4.4 | Resize Text | AA | [ ] Pending | [ ] Pending | Pending |
| 1.4.5 | Images of Text | AA | [ ] Pending | [ ] Pending | Pending |
| 1.4.10 | Reflow | AA | [ ] Pending | [ ] Pending | Pending |
| 1.4.11 | Non-text Contrast | AA | [ ] Pending | [ ] Pending | Pending |
| 1.4.12 | Text Spacing | AA | [ ] Pending | [ ] Pending | Pending |
| 1.4.13 | Content on Hover or Focus | AA | [ ] Pending | [ ] Pending | Pending |
| 2.1.1 | Keyboard | A | [ ] Pending | [ ] Pending | Pending |
| 2.1.2 | No Keyboard Trap | A | [ ] Pending | [ ] Pending | Pending |
| 2.1.4 | Character Key Shortcuts | A | [ ] Pending | [ ] Pending | Pending |
| 2.2.1 | Timing Adjustable | A | [ ] Pending | [ ] Pending | Pending |
| 2.2.2 | Pause, Stop, Hide | A | [ ] Pending | [ ] Pending | Pending |
| 2.3.1 | Three Flashes or Below Threshold | A | [ ] Pending | [ ] Pending | Pending |
| 2.4.1 | Bypass Blocks | A | [ ] Pending | [ ] Pending | Pending |
| 2.4.2 | Page Titled | A | [ ] Pending | [ ] Pending | Pending |
| 2.4.3 | Focus Order | A | [ ] Pending | [ ] Pending | Pending |
| 2.4.4 | Link Purpose (In Context) | A | [ ] Pending | [ ] Pending | Pending |
| 2.4.5 | Multiple Ways | AA | [ ] Pending | [ ] Pending | Pending |
| 2.4.6 | Headings and Labels | AA | [ ] Pending | [ ] Pending | Pending |
| 2.4.7 | Focus Visible | AA | [ ] Pending | [ ] Pending | Pending |
| 2.5.1 | Pointer Gestures | A | [ ] Pending | [ ] Pending | Pending |
| 2.5.2 | Pointer Cancellation | A | [ ] Pending | [ ] Pending | Pending |
| 2.5.3 | Label in Name | A | [ ] Pending | [ ] Pending | Pending |
| 2.5.4 | Motion Actuation | A | [ ] Pending | [ ] Pending | Pending |
| 3.1.1 | Language of Page | A | [ ] Pending | [ ] Pending | Pending |
| 3.1.2 | Language of Parts | AA | [ ] Pending | [ ] Pending | Pending |
| 3.2.1 | On Focus | A | [ ] Pending | [ ] Pending | Pending |
| 3.2.2 | On Input | A | [ ] Pending | [ ] Pending | Pending |
| 3.2.3 | Consistent Navigation | AA | [ ] Pending | [ ] Pending | Pending |
| 3.2.4 | Consistent Identification | AA | [ ] Pending | [ ] Pending | Pending |
| 3.3.1 | Error Identification | A | [ ] Pending | [ ] Pending | Pending |
| 3.3.2 | Labels or Instructions | A | [ ] Pending | [ ] Pending | Pending |
| 3.3.3 | Error Suggestion | AA | [ ] Pending | [ ] Pending | Pending |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | [ ] Pending | [ ] Pending | Pending |
| 4.1.1 | Parsing | A | [ ] Pending | [ ] Pending | Pending |
| 4.1.2 | Name, Role, Value | A | [ ] Pending | [ ] Pending | Pending |
| 4.1.3 | Status Messages | AA | [ ] Pending | [ ] Pending | Pending |

## Verification and release gate

Integration and E2E suites are added in the final commits, after the criterion commits. Tests use fictional local data. Automated checks cannot establish full WCAG conformance.

- [ ] Execute React unit/integration and browser suites, production build and coverage checks.
- [ ] Execute Flutter analysis, unit/widget/integration checks and web build.
- [ ] Execute Flutter browser E2E against the compiled web application.
- [ ] Human review: NVDA + Chrome/Firefox; VoiceOver + Safari/iOS; TalkBack + Android. Complete every process with keyboard only and screen reader; verify route, error and status announcements, focus return, headings and field names.
- [ ] Human review: all screens at 200% text, 400% browser zoom / 320 CSS px width, 256 CSS px height, both orientations, OS high contrast, and WCAG spacing overrides (line 1.5, paragraph 2, letter .12, word .16 em). Confirm readable content and operable controls without clipping or two-dimensional scrolling.
- [ ] Native device checks: OS text scaling, orientation, external keyboard/switch input, target contrast, text spacing equivalence and platform tooltips. Record platform/browser/AT versions and any failures before claiming conformance.

No legal or formal conformance claim is made until these manual checks and all five WCAG conformance requirements (level, full pages, complete processes, accessibility-supported technologies and non-interference) are assessed on the release build.
