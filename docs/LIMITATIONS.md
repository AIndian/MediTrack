# Current limitations

- Local prototype storage uses shared preferences without encryption. Use sample information only; production use needs appropriate secure storage, authentication and data handling.
- OS notifications, spoken reminders, caregiver access, calendar integration, exports and cloud sync are not implemented. The app describes them as unavailable.
- Schedules repeat daily. There is no automatic missed/overdue classification, timezone migration or background midnight refresh. Opening a new session uses the current date.
- Strength and amount share a dosage field. Supply is a manual count with a fixed low-supply threshold of 10; logging doses does not decrement it.
- Symptom timestamps are automatic. History covers 30 days; summaries offer 7 or 30 days. Allergies and medication-change records are not collected. Corrections replace statuses without an audit trail.
- Light appearance only. Several controls are simplified from the reference; see the design mapping. This is not a pixel-identical Figma export.
- Unit/widget tests and a web release build have been run locally. Android/iOS builds, native VoiceOver/TalkBack and physical-device keyboard operation have not been validated. Automated accessibility checks do not establish WCAG conformance.
- Check the GitHub Actions result for the commit you are using; local verification alone does not guarantee a successful hosted run.
