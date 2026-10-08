# MediTrack mobile design system

Prepared October 6, 2026. These prompts are ready for Figma Make and Figma Design's AI layout tool. They are instructions to run, not evidence that Figma AI has generated or saved a file. The initial Make request reached sign-in; generation is pending access.

## 1 Generate the mobile experience in Figma Make

Create a mobile-first interactive prototype for MediTrack, a medication tracking app primarily for adults aged 65 and older. The interface should feel calm, clear, and predictable. Prioritize reduced vision, reduced dexterity, limited technical experience, and offline access. Use fictional demonstration data only. This is a design prototype, not a medical recommendation or a functioning notification service.

Create exactly ten main screen destinations: Today; Medicines; Medicine details; Add medicine (Edit medicine variant); Review medicine; Medication reminder; Dose history; Symptoms; Appointment summary; Settings and sharing. Use four persistent navigation labels: Today, Medicines, History, More. More exposes Symptoms, Appointment summary, and Settings and sharing without adding another main screen. Include back navigation and preserve entered form values when navigating back.

Today shows Tuesday, October 6, the next scheduled dose, clearly labeled Taken, Skipped, Due, and Missed states, and a visible Log symptom action. Medicine details include the user's recorded name, strength, instructions, schedule, refill supply, and Edit, Archive, and Remove actions with a confirmation before removal. The entry form has persistent labels, examples, an accessible time selector, and inline errors. After invalid submission, focus a linked error summary; each error link focuses its field. Review shows all entered details before Save medicine. The reminder states exactly which medication and scheduled dose is due, plus recorded instructions; provide Mark Taken and Skip dose. Every dose change has Undo that remains until explicit dismissal or navigation, plus later correction from History. Never automatically mark a dose Skipped. Label a dose Missed only under an explicit configured overdue rule. No dose or treatment recommendations.

Symptoms supports symptom, severity, date/time, and optional notes with a clear local Save confirmation. Appointment summary supports a date range and includes medication list, dose history, symptoms, allergies if provided, refill information, and recent medication changes. Before export or sharing, show the selected fields and require an explicit confirmation. Show a Share preview state only; do not send or upload health data. Settings exposes appearance, a link to device text settings and respect for OS Dynamic Type or font scaling, spoken reminders, reminder permissions, and caregiver access. Separate View, Alerts, and Edit schedule caregiver permissions. All are off for a new caregiver; schedule editing requires a separate confirmation. Include revoke access. External caregiver and calendar integration are optional, not essential to local use.

Represent these secondary states: empty medicines; validation error; save/loading; saved offline and queued for sync; synced; sync conflict requiring review without silently overwriting either record; notifications disabled with an Open settings action; low supply with an edit refill action; dose Taken with Undo; history correction; caregiver permission review; report share preview; and export failure with retry. Notification and offline labels must explain the user's next action without technical jargon.

Use semantic tokens from tokens.json. Default light background #F3F7F6, surface #FFFFFF, text #16332D, muted text #4F665F, primary #176B5B, pressed primary #0E5144, secondary #275D8C, accent #7A4B00, success #176B43, warning #805500, error #A32932, info #235B8A, interactive border #71867F, focus #5C3CB7. Dark background #101D19, surface #1B2D26, text #F3F8F5, muted #B8CCC1, primary #86DDBE, pressed primary #B7F0D9, secondary #A4C9EF, accent #F1CE87, success #86DDB3, warning #F1CE87, error #FFB1B8, info #A4C9EF, border #829C8D, focus #D0BDFF. Use the final verified token file if any value differs from this initial direction. Light solid actions use white labels; dark solid actions use #101D19 labels. Never place white text on a pale dark-mode accent.

Use system UI fonts: SF Pro on Apple devices, Roboto on Android, Segoe UI fallback on Windows. Body 18/27, emphasized 18/27 semibold, small body and labels 16/24; nothing below 16 in the application. Heading sizes H1 36/54, H2 30/45, H3 26/39 at weight 700; H4 24/36, H5 22/33, H6 20/30 at weight 600. Do not use heading size to replace semantic hierarchy.

Prefer 56-unit-high controls, minimum 48 by 48 logical units; on Apple map units to points and on Android to dp, never physical screenshot pixels. Prefer 12 units between targets. Use 4/8/12/16/24/32/48 spacing, 12-unit control corners, and 20-unit card corners. Phone gutters 16, tablet gutters 24. Use persistent labels, large outlined controls, visible keyboard focus, status text with icons, and no color-only information. A 24-unit icon is centered in a minimum 48-unit hit area.

Support phone portrait and landscape at 393x852 and 412x915, and tablet portrait and landscape at 834x1194 and 800x1280. These are logical design-frame dimensions, not claims about every physical device. Use a single readable column on phones. At wide tablet widths use a persistent labeled navigation rail and list/detail or summary/detail panes. Adapt using available width and text size, not device branding. Honor platform safe areas and keyboard insets. At 200% text, stack actions, wrap labels, grow controls and cards, permit vertical scroll, and collapse tablet columns where needed. At short landscape heights keep navigation reachable without covering content. Never truncate medication names or instructions.

Use accessible semantic controls and meaningful screen reader labels. Reading order follows the visible hierarchy; hide decorative icons. Dialogs receive focus, trap it, close with Escape, and return focus to the opener. Tabs/navigation have selected state; checkboxes and toggles expose label and state. Announce saves and Undo politely; errors must also be visible and associated with their field. Let external keyboards reach every action without gestures. Add an annotations view showing numbered reading order, exact announcements, keyboard sequence, 48/56-unit target measurements, final contrast ratios, and behavior at 200%. Do not claim device screen reader testing has occurred.

## 2 Generate alternative wireframes with First Draft or its current Figma Design AI entry point

Create three alternative mobile layouts for the MediTrack Today screen: chronological list, time-of-day sections, and a next-dose hero followed by a chronological list. Use 393x852 portrait, 18-unit body text, 56-unit controls, text status labels, and four navigation destinations Today, Medicines, History, More. Include a Due medication with Mark Taken, a Taken medication with a timestamp, and a Log symptom action. Keep the same content across variants so layout can be compared. Place alternatives side by side with short labels. Do not introduce extra app features.

Select the next-dose plus chronological list direction for the main prototype. Keep the two alternatives on an Explorations page as visible AI process evidence. If the legacy First Draft entry point is absent, use the Figma Design agent equivalent. Record which tool was actually used.

## 3 Build the native component library in Figma Design

Create pages named 00 Read me, 01 Foundations, 02 Components, 03 Wireframes, 04 Phone, 05 Tablet, 06 Accessibility, and 07 AI Explorations. Convert the approved designs into native, reusable Figma components and instances. A Make prototype or imported SVG alone does not complete this step.

Create light and dark semantic color variables, spacing variables, and named typography styles matching the supplied foundations. Use Auto Layout and explicit resizing rules. Create component sets for Button (primary, secondary, text, icon); Input (text, select, checkbox, radio, switch); Card (content, medication); List (standard, expandable); Navigation (bottom bar, top app bar, drawer, rail); Feedback (spinner, progress bar, snackbar, dialog); and the described icon library. Each interactive component has Default, Hover, Pressed, Disabled, and Focus variants plus applicable selected, checked, error, loading, expanded, and filled properties. Keep noninteractive cards and indicators nonfocusable; document inactive states as not applicable rather than giving decorative content fake interaction. Use components.json for dimensions, padding, labels, and state behavior.

Build all ten main screens as instances at all four device frame sizes in portrait and landscape, making 80 device/orientation views. Use the preview and screens.json as the content and navigation reference. Show light mode throughout and representative dark mode frames for every screen family. Create a corresponding grayscale wireframe set with the same information hierarchy. Keep screen count separate from layout variant count.

## 4 Annotate and audit

On each main screen, add numbered callouts aligned with reading order. Include exact screen reader announcements, keyboard focus sequence, touch measurements, the relevant verified foreground/background contrast ratios, and 200% text behavior. Add dedicated 200% frames for Today, medication entry, reminder, and appointment summary at both narrow phone and tablet widths. Test intermediate text scales as well.

Use contrast-report.html and its WebAIM links to verify every permitted foreground/background pairing. Text must meet at least 4.5:1; UI outlines/icons/focus must meet at least 3:1 against adjacent surfaces. Use a contrasting surface gap around focus rings on solid controls so the ring remains distinguishable. Do not rely on opacity for disabled controls. Record actual evidence separately from design requirements.

## 5 Record actual Figma AI evidence

After generation, add the actual Figma file URL, tool name, generation date, prompts used, screenshots of at least one AI result, and a short note on manual accessibility corrections. Verify the native component sets, styles, and instances in the file. A prepared prompt is not evidence of AI use. Keep this item pending until the Figma file can be inspected.

## References

- [Figma First Draft and the current AI entry point](https://help.figma.com/hc/en-us/articles/23955143044247-Use-First-Draft-with-Figma-AI)
- [Create native Figma components](https://help.figma.com/hc/en-us/articles/360038663154-Create-components-to-reuse-in-designs)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/understanding/non-text-contrast.html)
- [W3C text resizing](https://www.w3.org/WAI/WCAG21/Understanding/resize-text)



