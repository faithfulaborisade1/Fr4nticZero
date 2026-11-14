# Decision Window: project notes for the build agent

NASA Space Apps 2026 entry. Static offline web app (Vite, React, TypeScript, Tailwind, Recharts, Vitest). Build spec: `HANDOFF.md` (kept outside the repo, ask the human for it).

## Keep the research doc current

`docs/RESEARCH.md` is a living document. Update it in the same commit whenever you change any of:

- a rule, threshold, action window or demo parameter (section 4)
- a source or a published figure (sections 2 and 3)
- a scenario or cross-link (sections 5 and 6)
- a design decision, limitation or disclosure item (sections 7 to 9)
- the team's own notes and their status (section 10)

Also bump the "Last updated" line and add a row to the changelog (section 11). Never mark a source as confirmed unless you opened the link and checked the number.

## Honesty rules

- Footer and README: "Prototype, not a medical device. All crew data is simulated."
- Every unsourced threshold and action window shows a "Demo parameter" badge.
- Decision-support wording only. No diagnosis, treatment or prediction language. No drug doses or calorie targets.
- Cross-links between hazards are labelled "under investigation".
- Do not push or deploy unless asked. The human owns the accounts.

## Commands

- `npm test` runs Vitest. `npm run build` type-checks and builds.
- Avoid heredocs that read stdin in the shell tool. Use the Write tool for files.
