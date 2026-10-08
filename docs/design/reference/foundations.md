# MediTrack mobile design foundations

Prepared 6 October 2026. Source context: the supplied MediTrack proposal and requirements document. These files define a mobile design specification; they do not establish creation of native Figma components, use of Figma AI, or tested native accessibility.

## Product principles

- Put medication name, entered strength/dosage, instructions, scheduled time, and Due/Taken/Skipped/Missed status in a consistent reading order.
- Use large labeled targets, plain language, immediate Undo, and permanent correction from dose history.
- Keep Today, reminders, medication details, dose logging, and symptom entry usable offline; explain locally saved / waiting-to-sync state.
- Caregiver viewing, alerts, and schedule editing are independent explicit permissions; schedule editing defaults off.
- Sample medication entries are fictional design content. Do not infer treatment recommendations or automatic dosage suggestions.

## Color roles and permitted combinations

The complete palette, all state colors, and every permitted foreground/background pairing are in `tokens.json`; `contrast-report.html` contains numerical ratios and parameterized WebAIM links. Use only those pairs. All text pairs meet 4.5:1, including large text. UI boundaries and focus meet 3:1. Do not add opacity to tokens. All 136 unique pairs have also been checked against the WebAIM public API; timestamped evidence is in `webaim-verification.json`.

| Role | Light | Dark |
|---|---|---|
| background | #F3F7F6 | #101D19 |
| surface | #FFFFFF | #1B2D26 |
| text | #16332D | #F3F8F5 |
| muted | #4F665F | #B8CCC1 |
| primary | #176B5B | #86DDBE |
| primaryHover | #125E50 | #A2E7CE |
| primaryPressed | #0E5144 | #B7F0D9 |
| onBrand | #FFFFFF | #101D19 |
| secondary | #275D8C | #A4C9EF |
| accent | #7A4B00 | #F1CE87 |
| success | #176B43 | #86DDB3 |
| warning | #805500 | #F1CE87 |
| error | #A32932 | #FFB1B8 |
| info | #235B8A | #A4C9EF |
| border | #71867F | #829C8D |
| focus | #5C3CB7 | #D0BDFF |
| surfaceHover | #E8F3EE | #233C30 |
| surfacePressed | #DBEBE2 | #294A3B |
| disabledSurface | #E4ECE8 | #2D4238 |
| successSurface | #E0F2E7 | #203F2E |
| warningSurface | #FFF1CC | #43391E |
| errorSurface | #FCE7E9 | #45292E |
| infoSurface | #E4EFFA | #243C50 |

Use primary for main action, secondary for supporting action, and accent for refill emphasis. Success communicates Taken/saved, warning communicates Due/low supply, error communicates Missed/invalid input, and info communicates offline/synchronization explanations. Every semantic signal also has a word and a distinct icon.

A 3-unit focus ring sits outside a 3-unit gap matching the surrounding surface. This ring must not directly touch a brand fill. Disabled controls use muted text on disabledSurface plus border, with no whole-component opacity reduction.

## Typography

Use native system fonts: SF Pro on iOS/iPadOS and Roboto on Android. Web prototypes use the system font stack. Body starts at 18 logical units; no body or supporting text is below 16. Every line height is at least 1.5 times font size.

| Style | Size | Weight | Line height | Use |
|---|---:|---:|---:|---|
| H1 | 36 | 700 | 54 | Welcome or an occasional single page title; use only one H1 per screen. |
| H2 | 30 | 700 | 45 | Primary screen heading: Today, Medicines, Appointment summary. |
| H3 | 26 | 700 | 39 | Major tablet pane or dialog heading. |
| H4 | 24 | 600 | 36 | Medication names and primary card headings. |
| H5 | 22 | 600 | 33 | Time groups and subsection headings. |
| H6 | 20 | 600 | 30 | Small section headings; preserve logical heading order. |
| Body | 18 | 400 | 27 | Default medication details, instructions, helper copy, and paragraphs. |
| Body emphasized | 18 | 600 | 27 | Dosage, status words, and short important phrases. |
| Body small | 16 | 400 | 24 | Secondary timestamps and supporting metadata; never critical dosage text. |
| Label | 16 | 600 | 24 | Buttons, inputs, navigation, and badges; wrap to additional lines. |

Heading appearance and semantic heading rank are separate. Use a logical H1 → H2 → H3 document outline without skipping ranks merely for size. Avoid all-capital labels. Do not truncate medication names or dosages.

## Touch, spacing, and platform units

Preferred target: 56 × 56 logical units. Hard minimum: 48 × 48. This exceeds 44 × 44 pt on iOS and meets 48 dp on Android (48 px on a 1× design canvas). Physical screen pixels are not platform density-independent units. Icons are usually 24 × 24 inside the larger target. Minimum 12-unit gap between adjacent actions; target rectangles must not overlap.

Spacing uses 4, 8, 12, 16, 24, 32, and 48. Phone gutter: 16; tablet gutter: 24; card padding: 16; card radius: 20; control radius: 12; dialog radius: 24. Interactive boundaries are 2 units. Do not use fixed heights for blocks containing text.

## Component library

Create the following native Figma component sets, with Light/Dark, Default/Hover/Pressed/Disabled/Focus, Preferred56/Minimum48, TextScale100/200, and iOS/Android variant axes where relevant. State specifications below are design definitions, not evidence that those native Figma sets already exist. Passive indicators explicitly have no interaction states.

### Button / Primary

- Anatomy: Filled primary container, optional leading 24-unit icon, Label text.
- Dimensions: min-height 56; min-width 56; full width for main phone action.
- Padding: 16 horizontal, 16 vertical, 8 icon gap.
- Example announcement: “Save medication, button”.
- Variants: default, loading, success, destructive.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Use one primary action per action group. Activate with Enter/Space. Loading retains text and reserves icon space; announce Saving. Do not submit twice.

### Button / Secondary

- Anatomy: Surface container, 2-unit secondary boundary, secondary Label.
- Dimensions: min-height 56; min-width 56.
- Padding: 16 horizontal, 16 vertical, 8 icon gap.
- Example announcement: “Edit schedule, button”.
- Variants: default.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Use secondary color for boundary and text; hover/pressed use surfaceHover/surfacePressed. Pair with primary only when choices are clear.

### Button / Text

- Anatomy: Primary Label on surface; underline on pointer hover.
- Dimensions: min-height 48; preferred 56; min-width 48.
- Padding: 12 horizontal, 12 vertical.
- Example announcement: “Cancel, button”.
- Variants: default.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: No boundary is required for the visible text action; text-to-surface passes 4.5. Full padded area is tappable. Never present destructive action as an ambiguous text link.

### Button / Icon

- Anatomy: 24-unit icon inside 56-unit surface container, optional border.
- Dimensions: 56x56 preferred; 48x48 minimum.
- Padding: 16 for preferred target; at least 12 around 24-unit icon.
- Example announcement: “Back, button; Add medication, button; Close dialog, button”.
- Variants: default.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Supply an explicit accessible name. Add tooltip for mouse/keyboard. Critical actions use a visible text label beside the icon. Decorative duplicate icons are hidden from screen readers.

### Input / Text field

- Anatomy: Persistent label, surface field, text, 2-unit border, helper/error message.
- Dimensions: min-height 56; content-driven height.
- Padding: 16 horizontal, 16 vertical; 8 label and helper gaps.
- Example announcement: “Medication name, text field, required”.
- Variants: empty, filled, required, error, read only.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Error: error border and icon plus plain-language error text; error text uses error on surface. Never clear entered data.
- Behavior: Use visible labels, appropriate keyboard/input type, autocomplete only where accurate, and explicit instructions. Error associates message with field and sets invalid. After an invalid Save, move focus first to a linked error summary that identifies each problem; each summary link moves focus to its invalid field. Preserve entered values.

### Input / Dropdown

- Anatomy: Persistent label, current option or prompt, chevron, border.
- Dimensions: min-height 56; menu rows min-height 56.
- Padding: 16 horizontal, 16 vertical; 8 icon gap.
- Example announcement: “Frequency, Daily, pop-up button, collapsed”.
- Variants: closed, open, selected, error.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Prefer native select/picker. Tap or Space opens; arrows move options, Enter selects, Escape closes; focus returns to trigger. Announce selected option and expanded state.

### Input / Checkbox

- Anatomy: 24-unit outlined or filled checkbox and Label inside full-row target.
- Dimensions: row min-height 56; box 24x24; target min 48x48.
- Padding: 12 horizontal, 12 vertical; 12 label gap.
- Example announcement: “Include symptoms, checkbox, checked”.
- Variants: unchecked, checked, mixed.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Entire label row toggles selection; Space changes checked state. Primary fill plus onBrand checkmark. Group related options with a named legend.

### Input / Radio

- Anatomy: 24-unit radio outline/dot plus Label inside full-row target.
- Dimensions: row min-height 56; radio 24x24; target min 48x48.
- Padding: 12 horizontal, 12 vertical; 12 label gap.
- Example announcement: “Daily, radio button, selected, 1 of 3”.
- Variants: unselected, selected.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: One selected option per named group. Arrow keys navigate options; Space selects. Primary dot and border provide shape/state change as well as color.

### Input / Toggle

- Anatomy: 52x32 track with 24-unit thumb, visible label and On/Off text.
- Dimensions: whole row min-height 56; hit area min 56x56.
- Padding: 12 vertical, 16 horizontal; 12 label gap.
- Example announcement: “Spoken reminders, switch, off”.
- Variants: off, on.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Switch has stable name; state announces on/off. Space toggles. Off uses border and surface; on uses primary track/onBrand thumb. Use only for immediate settings, never Save.

### Card / Content

- Anatomy: Surface container, heading, supporting text, status, optional action.
- Dimensions: content-driven; all nested actions min 48x48.
- Padding: 16 padding; 12 content gap; 16 action gap.
- Example announcement: “Lisinopril, 10 milligrams, due at 8 AM, heading”.
- Variants: static, interactive, selected.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Static cards: no visual change. Interactive cards: surfaceHover and visible border.
- Pressed: Static cards: no visual change. Interactive cards: surfacePressed.
- Disabled: For static cards: not applicable. For interactive cards: common disabled treatment and announce unavailable.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Noninteractive card itself is not a tab stop; expose its heading and individual actions. For a fully clickable card use one action and no nested interactive children. Keep critical dosage in Body emphasized.

### Card / List item

- Anatomy: Leading icon, title, supporting text, trailing status/chevron.
- Dimensions: min-height 72; content-driven at 200%.
- Padding: 16 horizontal, 12 vertical; 12 icon gap.
- Example announcement: “Lisinopril, 10 milligrams, Daily at 8 AM, button”.
- Variants: default, selected, unread.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: A whole-row navigation target announces one concise name. Keep trailing status included in its name; no hidden swipe-only actions. Add visible More action when row actions are required.

### Navigation / Bottom bar

- Anatomy: Four labeled destinations: Today, Medicines, History, More.
- Dimensions: each target min 56x64; bar grows with text; system inset additional.
- Padding: 8 vertical; 4 horizontal per destination.
- Example announcement: “Today, tab, selected, 1 of 4”.
- Variants: default, selected.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Persist labels; selected icon shape/indicator plus text weight and primary color. Use route navigation semantics appropriate to platform. Do not announce hidden inactive pages. At 200% use two lines and increase height.

### Navigation / Top app bar

- Anatomy: Back/menu action, title, optional contextual action.
- Dimensions: min-height 72 plus safe area; grows with content.
- Padding: 16 horizontal; 8 vertical; 8 between controls.
- Example announcement: “Back, button; Medication details, heading; More options, button”.
- Variants: default.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Focus order: Back, title, contextual action, main content. Title wraps at 200%; never replaces essential title with an ellipsis. On small landscape, bar remains compact with main content scrollable.

### Navigation / Drawer and rail

- Anatomy: Named navigation region, account summary, labeled destination rows.
- Dimensions: drawer width min(320, viewport-48); item min-height 56; rail 88 or content-fit.
- Padding: 16 container padding; 12 item gap.
- Example announcement: “Main navigation; Appointment summary, link”.
- Variants: drawer closed, drawer open, rail, selected.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Compact drawer opens from More/Menu; modal drawer traps focus, Escape dismisses, and restores trigger focus. Tablet rail remains persistent; selected destination has shape and text cue.

### Feedback / Spinner

- Anatomy: 24-unit primary arc and visible Loading text.
- Dimensions: indicator 24x24; surrounding loading region min-height 56.
- Padding: 12 icon/text gap; 16 region padding.
- Example announcement: “Loading medications, status”.
- Variants: indeterminate.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Not applicable: passive status indicator; no keyboard focus.
- Pressed: Not applicable: passive status indicator; no keyboard focus.
- Disabled: Not applicable: passive status indicator; no keyboard focus.
- Focus: Not applicable: passive status indicator; no keyboard focus.
- Behavior: Not interactive; no hover/pressed/disabled/focus states. Mark containing region busy; announce once politely. Keep usable navigation. Reduced motion uses a static progress icon.

### Feedback / Progress bar

- Anatomy: Primary fill, border-backed track, visible label and value.
- Dimensions: track min-height 8; total region min-height 48.
- Padding: 8 label/track gap; 16 region padding.
- Example announcement: “Preparing summary, progress bar, 60 percent”.
- Variants: determinate, complete.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Not applicable: passive progress display; no keyboard focus.
- Pressed: Not applicable: passive progress display; no keyboard focus.
- Disabled: Not applicable: passive progress display; no keyboard focus.
- Focus: Not applicable: passive progress display; no keyboard focus.
- Behavior: Expose min=0, max=100, current value; meaningful changes announced politely, no per-frame announcements. Text percentage conveys progress without color. Not an interactive target.

### Feedback / Snackbar or toast

- Anatomy: Info/success surface, message, optional Undo action and Close action.
- Dimensions: content-driven; actions min-height 48.
- Padding: 16 padding; 12 message/action gap.
- Example announcement: “Dose marked as Taken. Undo available, status; Undo, button”.
- Variants: information, success, warning, error.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Use a polite live region; no automatic focus theft. Dose Undo persists until explicit dismissal or navigation, with no automatic timeout. Dose-history correction remains permanently available after dismissal or navigation. At 200% stack actions.

### Feedback / Dialog

- Anatomy: Modal surface, title, plain-language consequence, Cancel and primary action.
- Dimensions: max-width 560; max-height viewport minus 48; content scrolls.
- Padding: 24 padding; 16 content gap; 12 action gap.
- Example announcement: “Remove medication, dialog; Removing this medication will not delete past dose records.”.
- Variants: confirmation, error, form.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Name dialog from heading; place initial focus on safe action or heading. Trap Tab/Shift+Tab, Escape closes safe dialogs, return focus to trigger. Stack full-width actions at 200%; never hide Cancel.

### List / Standard

- Anatomy: Named list, grouped heading, list item components.
- Dimensions: rows min-height 72; interactive rows min 48x48.
- Padding: 16 horizontal, 12 vertical; optional 2-unit meaningful separators.
- Example announcement: “Morning medications, list, 3 items”.
- Variants: empty, populated, loading, error.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Use semantic list/list item structure. Passive rows are not tab stops; links/buttons are. Virtualized lists must preserve order/count for screen readers. Content wraps and expands.

### List / Expandable

- Anatomy: Heading button, summary, chevron, controlled detail region.
- Dimensions: header min-height 56; details content-driven.
- Padding: 16 horizontal, 16 vertical; 12 detail gap.
- Example announcement: “October 6, 3 doses, collapsed, button”.
- Variants: collapsed, expanded.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Enter/Space toggles; announce expanded state and controlled region relationship. Open content follows trigger in reading order. Keep selection independent from expansion.

### Icon / Library

- Anatomy: Consistent 24x24 outlined icon with 2-unit stroke; fill/shape cue for selected state.
- Dimensions: 24x24 glyph; interactive wrapper 56x56 preferred, 48x48 minimum.
- Padding: 16 around glyph at preferred target.
- Example announcement: “Name by action, such as Add medication, never Plus icon”.
- Variants: outline, selected, decorative.
- Default: Use documented foreground/background/border pair; show a persistent descriptive text label.
- Hover: Pointer/external mouse only: surfaceHover, or primaryHover for filled primary. Keep text unchanged and preserve the visible boundary.
- Pressed: surfacePressed, or primaryPressed for filled primary. Maintain label and icon; release returns to default. No press-only information.
- Disabled: muted text on disabledSurface with border; explain the reason in adjacent helper text where needed. Announce disabled and exclude from action activation; avoid making required help inaccessible.
- Focus: 3-unit focus ring with 3-unit surface-colored offset. Persist during external-keyboard navigation. Do not clip ring; no focus indication on touch-only focus unless the platform provides it.
- Behavior: Use platform system symbols where possible. Hide decorative icons; meaningful noninteractive icons have text equivalent. Do not rely on color, pill shape, or image recognition to identify medication.

## Icon library

| Icon | Meaning | Example accessible label |
|---|---|---|
| home | Today schedule | Today, tab |
| pill | Medication list or record | Medicines, tab |
| clock | Time or dose history | History, tab |
| more | Additional navigation | More, tab |
| plus | Create a record | Add medication, button |
| arrow-left | Return to previous view | Back, button |
| check-circle | Dose taken | Taken |
| clock-alert | Dose due | Due |
| minus-circle | Dose skipped | Skipped |
| alert-triangle | Dose missed or warning | Missed |
| bell | Reminder settings | Reminder settings, button |
| volume | Spoken reminders | Spoken reminders, switch |
| calendar | Appointment date or export | Choose appointment date, button |
| clipboard | Appointment summary | Appointment summary, button |
| heart | Symptom entry | Add symptom, button |
| users | Caregiver access | Caregiver access, button |
| cloud-off | Offline status | Offline. Changes are saved on this device. |
| sync | Pending synchronization | Changes waiting to sync |
| edit | Modify existing record | Edit medication, button |
| trash | Remove record | Remove medication, button |
| chevron-down | Expand section | Section name, collapsed, button |
| close | Dismiss transient view | Close, button |
| info | Additional explanation | Information |
| refill | Supply and refill information | Refill information, button |
| settings | Preferences | Settings, button |
| moon | Dark appearance | Dark mode, switch |

## Responsive layout and navigation

- iPhone: 393 × 852 portrait and 852 × 393 landscape. Android phone: 412 × 915 portrait and 915 × 412 landscape.
- iPad: 834 × 1194 portrait and 1194 × 834 landscape. Android tablet: 800 × 1280 portrait and 1280 × 800 landscape.
- Below 600 logical units: one content column and four labeled bottom destinations (Today, Medicines, History, More).
- At 600–839: persistent labeled rail and one content column or adaptive cards.
- At 840 and wider: rail plus list/detail panes where useful. Maximum reading/content width is 1120; text paragraphs should remain comfortably narrow.
- Landscape follows available width and height, not device name. On a short phone viewport, content scrolls and major actions remain reachable without covering content. Respect status bars, notches, home indicators, gesture edges, on-screen keyboards, and safe areas.
- Tablet keyboard flow: navigation → app bar → content heading → filters/fields → cards/actions → secondary actions. Tab follows visual order, Shift+Tab reverses, Enter activates, Space toggles, arrows operate native grouped controls, Escape closes transient overlays.
- Drawer and dialog trap focus while modal and restore it to their opening control when dismissed. Persistent rail never traps focus.

## Accessibility annotation template

Each mockup must include: (1) numbered reading-order markers; (2) accessible name/role/value for each actionable element; (3) numbered external-keyboard path; (4) measured touch rectangles; (5) text and control contrast ratios for actual pairings; (6) a 200% reflow note and a rendered enlarged example. A note alone does not prove runtime behavior.

At 200% text: change 18/27 to 36/54 and 16/24 to 32/48; let fields, cards, and headers grow; wrap labels; stack action groups; reduce two-pane content to one pane when reading width is insufficient; preserve visible bottom-navigation labels and increase bar height. Make dialog body scroll inside the available viewport with both actions reachable. Do not reduce enlarged text to fit.

## Verification boundary

- Local numerical audit: 198 approved pair entries, all pass unrounded thresholds. Black/white reference ratio is checked at 21:1; #777777 on white is checked to fail normal text; typography is checked for minimum 16 and line-height ratio 1.5.
- WebAIM: all 136 unique pairs covering 198 approved usages verified using its public Contrast Checker API on 6 October 2026. All meet the required thresholds; differences from local ratios are within the precision displayed by WebAIM (three significant digits, truncated). See `webaim-verification.json` for exact URLs, responses, and UTC timestamps.
- Native Figma variables/component sets, Figma Make/First Draft provenance, iOS VoiceOver, Android TalkBack, physical touch sizes, tablet external-keyboard operation, and real OS text scaling need separate validation evidence.
- Static wireframes and a browser prototype validate design intent; they do not prove a functioning medication application.
