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
| 1.3.2 | Meaningful Sequence | A | [x] Mobile navigation and large-text header now follow DOM reading order. | [x] Widget order follows header, content, then bottom navigation; wide columns keep coherent groups. | Compare visual, DOM and semantics order at narrow/wide sizes. |
| 1.3.3 | Sensory Characteristics | A | [x] Named actions and explicit times; no position/shape-only instructions. | [x] Same textual action names and times. | Review instructions across all screens. |
| 1.3.4 | Orientation | AA | [x] Responsive layouts; no orientation lock. | [x] No SystemChrome lock; iOS supports all four orientations. | Portrait/landscape browser and Flutter viewport matrix; hardware rotation pending. |
| 1.3.5 | Identify Input Purpose | AA | [x] N/A: fields describe medicines/symptoms, not user personal-profile data in WCAG input-purpose list. | [x] N/A: same domain fields; no personal-profile inputs. | Do not mislabel medicine name as autocomplete=name; reassess for future profile forms. |
| 1.4.1 | Use of Color | A | [x] Status words, error messages and active-nav borders accompany color. | [x] Selected destination now also has a border; status words and error text accompany color. | Review grayscale/semantics; selection remains programmatically exposed. |
| 1.4.2 | Audio Control | A | [x] N/A: no audio output or autoplay. | [x] N/A: no audio output or autoplay. | Source review of both applications. |
| 1.4.3 | Contrast (Minimum) | AA | [x] Explicit dark text, muted text and error/status palettes on light surfaces. | [x] Pin muted/error foregrounds and backgrounds instead of seed-derived colors. | Contrast ratio assertions in final integration suites; rendered/device review pending. |
| 1.4.4 | Resize Text | AA | [x] Relative font sizes, 100-200% in-app scale and unrestricted browser zoom. | [x] Preserve nonlinear system text scaling when larger; remove arbitrary system-size cap. | Existing text-size tests plus final 200% viewport matrix. |
| 1.4.5 | Images of Text | AA | [x] All UI copy is rendered text; SVG is a decorative symbol. | [x] All UI copy is Text widgets; icons carry no text images. | Source review; no rasterized instructions or labels. |
| 1.4.10 | Reflow | AA | [x] Wrapping brand/controls and flexible grid; no fixed page heights. | [x] Scroll header with content, wrap external field labels and bound scrollable mobile navigation. | Final matrix at 320px width / 256px height, 200% text and 400% zoom equivalent. |
| 1.4.11 | Non-text Contrast | AA | [x] Input outlines, focus rings and active borders exceed 3:1 against adjacent light surfaces. | [x] Pin outline/outlineVariant and enabled field border; selected navigation has dark border. | Ratio assertions; decorative card borders are not control boundaries. |
| 1.4.12 | Text Spacing | AA | [x] No fixed text-box heights; long badge text wraps under spacing overrides. | [x] External labels and multiline errors; native Text respects system font settings. | Browser spacing override suite; Flutter web semantics/CSS cannot restyle canvas text, so native spacing equivalence needs human review. |
| 1.4.13 | Content on Hover or Focus | AA | [x] N/A: no custom hover/focus popovers; content is always available. | [x] No custom hover popovers; BackButton uses platform tooltip behavior. | Keyboard/hover inspection; platform tooltip Escape/hover behavior remains a manual release check. |
| 2.1.1 | Keyboard | A | [x] Native links, buttons, fields, selects and keyboard-adjustable range. | [x] Material controls; explicit text-size buttons provide keyboard/pointer alternative to slider gestures. | Final keyboard workflows and Flutter focus traversal tests. |
| 2.1.2 | No Keyboard Trap | A | [x] No custom key suppression or modal focus traps. | [x] Standard Navigator/Material controls; Tab/Shift+Tab and Escape for dropdown. | Final bidirectional keyboard tests; native external-keyboard check pending. |
| 2.1.4 | Character Key Shortcuts | A | [x] N/A: no unmodified character shortcuts. | [x] N/A: no unmodified character shortcuts. | Source review of keyboard handlers. |
| 2.2.1 | Timing Adjustable | A | [x] No session timeout, timed form or expiring Undo. | [x] No session timeout or expiring Undo. | Existing Undo-after-five-minutes widget test; no timed interaction limits. |
| 2.2.2 | Pause, Stop, Hide | A | [x] Pause clock updates toggle stops visible automatic time updates without freezing the day/store. | [x] Same toggle; resumes with current time and no live-region ticking. | Final fake-clock tests verify pause/resume across minute changes. |
| 2.3.1 | Three Flashes or Below Threshold | A | [x] No flashing media, strobes or flashing animations. | [x] No flashing media or effects; normal Material transitions. | Source review of CSS/widgets/assets; no flashing content introduced. |
| 2.4.1 | Bypass Blocks | A | [x] Existing skip link focuses main; native main/nav landmarks. | [x] Shared page skip action focuses/scrolls heading; semantic headings support AT bypass. | Keyboard skip tests; screen-reader landmark/heading review pending. |
| 2.4.2 | Page Titled | A | [x] Page effect sets descriptive document title on every route. | [x] Shared page now sets platform/browser Title and route-name semantics. | Final route-title assertions across screens. |
| 2.4.3 | Focus Order | A | [x] Page headings focus on navigation; Undo restores focus; removed history entry returns focus to heading. | [x] Widget-order page traversal, page-heading focus, Undo return focus and history traversal before removal. | Final focus/keyboard integration checks; hardware focus-return review pending. |
| 2.4.4 | Link Purpose (In Context) | A | [x] Open links include medicine/time; other links describe destinations. | [x] Open actions use medicine/time; Back and destination labels remain descriptive. | Accessible-name and workflow assertions. |
| 2.4.5 | Multiple Ways | AA | [x] Main navigation plus contextual Today/history, Medicines/detail, and More/summary/symptom routes. | [x] Main destinations plus contextual Today history/symptom/summary actions. | Forms/review are process steps; final workflows cover alternate entry routes. |
| 2.4.6 | Headings and Labels | AA | [x] One page h1, descriptive section headings and explicit labels. | [x] Page/section heading levels and wrapping, programmatic field labels. | Final DOM/semantics assertions; human heading review pending. |
| 2.4.7 | Focus Visible | AA | [x] Existing 3px purple outline on focusable controls and programmatic headings. | [x] Explicit button/input focus borders plus visible focused page heading. | Final focus-style/contrast assertions and browser keyboard tests. |
| 2.5.1 | Pointer Gestures | A | [x] Single-click controls; native range supports track click and keyboard. | [x] Slider has explicit percentage buttons; no multipoint/path-dependent actions. | Keyboard and button alternatives tested in final suites. |
| 2.5.2 | Pointer Cancellation | A | [x] Actions use click activation after release; no pointerdown mutations. | [x] Material onPressed fires after successful tap; no down-event writes. | Browser pointer down/move-out/up cancellation E2E; native cancellation check pending. |
| 2.5.3 | Label in Name | A | [x] Visible text supplies action names; text-size value extends visible label. | [x] Visible labels supply semantic names; slider label contains Text size. | Final role/name assertions; speech-input manual check pending. |
| 2.5.4 | Motion Actuation | A | [x] N/A: no motion/sensor activation. | [x] N/A: no motion/sensor activation. | Source review; all actions have visible controls. |
| 3.1.1 | Language of Page | A | [x] HTML host already declares English. | [x] Flutter HTML host now declares English; app explicitly declares supported locale. | Final host/locale assertions. |
| 3.1.2 | Language of Parts | AA | [x] English UI; medicine names/user notes have no inferred foreign-language tagging. | [x] Same English UI; user-entered names/notes retain original text. | N/A for authored language changes; proper names/indeterminate language are exempt. Reassess localized content. |
| 3.2.1 | On Focus | A | [x] Focusing never submits, writes records or navigates. | [x] Same; focus only changes presentation/scroll position. | Final keyboard focus-without-activation tests. |
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
