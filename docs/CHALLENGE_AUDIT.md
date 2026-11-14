# Challenge coverage audit

Reviewed 14 November 2026 against the [official challenge page](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/) and its Resources tab, which were readable in a browser on the second attempt. Confirm the current official submission guide before submitting.

| Challenge objective or consideration | Current coverage | Remaining limitation |
| --- | --- | --- |
| Clickable figure showing each part's function and status | Each body region opens "What it does", "Why we check it in space", its status and trends. | Function text is plain-language education, not a clinical reference. |
| Visual health assessment | Body map, personal baselines, status badges, graphs and decision cards for simulated crew. A per-profile workout log is available in the bones view. | Some body regions show fixed example status rather than a full assessment; workouts do not assess bone health. |
| Gather indicators | Users enter blood pressure, heart rate, blood sugar, temperature, sleep and mood; check-ins update the local selected profile. Images may be attached to simulated decisions. | No connected medical sensors, no automated image analysis, and the displayed oxygen percentage is only an example. |
| Act and improve health | Cards show a verdict, simulated action window and short checklist; the mission risk guide describes preparation. A persistent emergency link explains how to seek crew and ground support. | **Partial:** not validated treatment instructions or an emergency medical protocol. The emergency page does not send an alert. Thresholds and timings are demo parameters; no clinical or flight approval. |
| Explain measurements and hazards | Body-system and decision details describe measurement context and NASA hazards; check-in forms offer linked measurement guides. | The guides use general Earth-based references, not approved flight procedures. Hardware availability varies by mission. |
| Show when crew or ground should pay attention | Decision cards and ledger model urgency, delay and a flight-surgeon review. | Surgeon review and automatic buddy escalation are simulated. Shared crew notices work separately and are sent manually; there are no emergency or background notifications. |
| Different environments, optional | Space station, Moon surface base, lunar rover and Mars transit change the communication model and mission-risk guide. On the rover only part of the medical kit is carried. | Switching environments does not model all physical differences (gravity level, suit work). |
| Periodic prompts, optional | The daily check-ins page and overview show in-app reminders for six manually logged indicators using the simulated mission day, per profile. | No background notifications or real-world schedule; the simulated clock may be paused. |
| Gamification, optional | Daily routine ring (six check-ins and a workout), a streak of full check-in days and points for logging habits; steps can be marked complete with resource and time use. | Light only: no rewards, levels or team leaderboard. Points are engagement, never a health score. |
| Dynamic charts and meaningful colour, optional | Trends, projections and body-system status combine colours with text and symbols. | The projection uses simulated readings and demonstration parameters; it is not a clinically validated prediction. |
| Plain explanations, optional | Explanations appear in decision cards, region details and the mission-risk guide. | More detailed measurement instructions and clinician review would improve the product. |

## NASA resources and data

The local-event copy lists [NASA's five hazards](https://www.nasa.gov/hrp/hazards/), [NASA's risks](https://www.nasa.gov/hrp/risks/), [ongoing HRP research](https://www.nasa.gov/hrp/ongoing-hrp-research/), and two CSA resources. The app's hazard categories and mission-risk guide use the first two as a framework and now link to them. The separate research page displays historical NASA OSD-569/575 laboratory results and ISS environmental telemetry; these are additional NASA datasets and do not drive the simulated decisions. Explain both uses clearly in the project submission and confirm with the official submission guide whether they meet the current challenge-specific NASA data rule.

## Submission checks

- NASA's [2026 event page](https://www.spaceappschallenge.org/2026/) says project submission closes 15 November at 11:59 p.m. local time and teams may have no more than six participants. Local judging can have a different deadline.
- The [NASA Space Apps community discussion](https://github.com/nasa/spaceapps/discussions/1947) contains a Navigator answer describing a maximum 30-second demo video or seven-slide presentation, challenge-listed NASA data, and AI disclosure. The official guide was unavailable to this audit; confirm the exact requirements there and with the local event.
- Confirm every participant is registered for the correct event and team, the project page is completed and actually submitted, and demonstration links are accessible to judges.
- The body illustrations are AI-generated and now visibly labelled. Disclose AI assistance in the submission and verify the event's image-disclosure rules.
- The local development server and crew server are not a public deployment. No submission, public demo link, permissions, eligibility, or local judging deadline has been verified from this workspace.
