# Decision Window: project notes for the build agent

NASA Space Apps 2026 entry. Static offline web app (Vite, React, TypeScript, Tailwind, Recharts, Vitest). Build spec: `HANDOFF.md` (kept outside the repo, ask the human for it).

## Keep the research doc current

`docs/RESEARCH.md` is a living document. Update it in the same commit whenever you change any of:

- a rule, threshold, action window or demo parameter (section 4)
- a source or a published figure (sections 2 and 3)
- a scenario or cross-link (sections 5 and 6)
- a design decision, limitation or disclosure item (sections 7 to 9)
- the team's own notes and their status (section 10)

The README is built from this document. When the app's behaviour, limitations, sources or disclosure change, update `README.md` in the same commit and re-check each claim in it against the running app.

Also bump the "Last updated" line and add a row to the changelog (section 11). Never mark a source as confirmed unless you opened the link and checked the number.

## Honesty rules

- Footer and README must say this is a prototype, not a medical device; distinguish simulated mission data from the separate historical NASA research data.
- Every unsourced threshold and action window shows a "Demo parameter" badge.
- NASA research results remain historical and separate from the simulated decision path; do not represent them as live data or as validation of the decision engine.
- Decision-support wording only. No diagnosis, treatment or prediction language. No drug doses or calorie targets. The one exception is the trend projection: it must say "projection", show its basis (last 7 readings, straight line) and carry the Demo badge. Do not add a trained ML model without real data to validate it.
- Images attached to a decision are never analysed and never uploaded. Keep only the small preview, in local storage.
- Cross-links between hazards are labelled "under investigation".
- Do not push or deploy unless asked. The human owns the accounts.

## Commands

- `npm test` runs Vitest. `npm run build` type-checks and builds.
- Avoid heredocs that read stdin in the shell tool. Use the Write tool for files.
