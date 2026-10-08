# Mapping to the supplied HTML implementation

Reference: `reference/index.html`, specifically `.device-viewport`, `renderScreen()`, `medicineCard()`, and the responsive styles. The surrounding website's controls, annotation sidebar, device bezel, and simulated status bar are presentation tools, not app UI, and are intentionally omitted. Native safe areas replace the mock status bar.

| Reference | Flutter implementation |
|---|---|
| Teal `#075E64`, canvas `#F6FAF9`, white surface, ink `#183B42`, muted `#52686C` | Theme and shared widgets use these HTML colors rather than the different JSON palette. |
| Header with health mark and MediTrack branding | Shared `AppPage` header, with native back control on detail routes and a live local-time clock at the top right. At enlarged text sizes the clock occupies its own right-aligned row. |
| 32px page titles, 16px body, 1.5 line height | Page headings/body theme; semantic heading annotations. |
| `.card`, `.card.emphasis` | White, 18px rounded bordered panels with 20px padding; first Today card has a 2px teal border. |
| `.pill-icon`, `.badge` | Mint medicine icon tile; text-and-icon Due/Taken/Skipped badges, with success/warning colors. |
| `.btn` and `.btn.secondary` | 56px minimum targets, 12px corner radius; stacked filled Taken and outlined Skip actions, plus persistent Undo. |
| Four destinations; selected mint background | Today, Medicines, History, More with labels, icons, selected semantics and mint selection. |
| 700px tablet breakpoint and 205px rail | Matching threshold and rail width; Today summary becomes a side column where content width permits. |
| Enlarged text navigation | Two-by-two navigation at 200%; card content grows and scrolls. |
| Today: dose emphasis, later schedule, day summary | Real saved doses and dynamic Taken progress; links to history, symptoms and summary. |
| Medicine details, add and review | Saved instructions, daily schedule, supply, archive/restore, labeled form sections, two-step review and Edit details action. |
| History, symptoms, summary, More | Same screen purposes, headings and workflow grouping; actual local records replace hard-coded demonstration content. |

Intentional functional adaptations: medicine list entries use cards rather than the compact HTML list; secondary detail routes have a Back control instead of persistent navigation; form uses one combined strength/dosage field and comma-separated daily times; symptom severity uses a native dropdown and timestamp rather than radio buttons and editable date/time; summary uses readable sections rather than disclosures. The current implementation supports the HTML's light appearance only. Inactive integrations have explanatory text instead of switches that would imply working notifications or sharing.

Verification: all ten screens exercised at 393×852 and 200% scaling without framework overflow errors; phone snapshot rendered from Flutter and inspected. Main workflow tests run at 800×600, exercising the tablet rail. Real Figma-native components were not available in this mirror, so the HTML is the implementation reference, not proof of native Figma parity.
