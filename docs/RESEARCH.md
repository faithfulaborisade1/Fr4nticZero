# Decision Window: research and decisions log

Living document. Updated whenever a rule, threshold, source, scenario, cross-link or design decision changes (see `CLAUDE.md`). The README is built from this file.

Last updated: Saturday 14 Nov 2026, end of build step 7.

## 1. What we are building

A static, offline-capable web app for the NASA Space Apps 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions". The home screen is a body scan. Every flagged reading becomes a **decision card** answering: *whose call is this, and by when?*

Pitch: the same reading means "ask Houston" in orbit and "your call" on the way to Mars.

Verdict algorithm (`src/engine/verdict.ts`):

1. `earthReplyMin = 2 * oneWayDelaySec / 60 + GROUND_RESPONSE_MIN` (15 min, demo parameter).
2. Reading ok: no card.
3. No action window, or the rule says "watch": **Monitor**.
4. Blackout, or `earthReplyMin > actionWindowMin`: **Crew decides now**.
5. Otherwise: **Consult Earth, hold meanwhile**, with a countdown.

Worked example (blood pressure, window 30 min): Station reply about 15 min, so consult Earth. Mars at 22 min one way: reply 59 min, so crew decides. The flip happens between 7 and 8 min one way.

## 2. Open items to confirm (not yet verified)

- [ ] Official challenge text. The brief we have is second-hand. Compare objectives with `HANDOFF.md` section 3.
- [ ] 2026 Project Submission Guide: demo length, AI-tool disclosure rules.
- [ ] 2026 Judging and Awards Guide: criteria wording (the guide read for the brief carried 2024 dates).
- [ ] Every source link below, opened and the number confirmed. **None has been opened by the build agent yet.**
- [ ] Whether a planning document counts as allowed pre-work (participant FAQ: no work on challenges before the hackathon). Disclose it.
- [ ] Which NASA OSDR dataset (Inspiration4 processed data) to use for the "real data" touch. The PDF says use at least one real dataset; the handoff says stretch. Not started.

## 3. Sources (copied from the handoff, to be confirmed at the link)

| Hazard | Figure | Used for | Link |
| --- | --- | --- | --- |
| Radiation | Career limit under 600 mSv; 250 mSv per solar particle event | Dose gauge and bands (`bands.ts`) | https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf |
| Isolation (sleep) | 8.5 h scheduled; about 6 h achieved on ISS | Sleep chart reference lines | https://www.eurekalert.org/news-releases/541449 |
| Immune | Herpes viruses shed by 53% of shuttle and 61% of ISS astronauts; 6 had symptoms | Viral-reactivation flag text (not yet in UI) | https://bigthink.com/surprising-science/herpes-astronauts |
| Distance | Mars up to 22 min one way; Moon 3 to 14 s one way | Environment slider (`environments.ts`) | https://ntrs.nasa.gov/api/citations/20230015521/downloads/Human%20Health%20and%20Performance.pdf and https://ntrs.nasa.gov/citations/20250000703 |
| Gravity (bone) | About 1 to 1.5% bone mineral loss per month without countermeasures | Bone-loss estimate (not yet in UI) | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-030-bone-loss.pdf |
| Gravity (eyes) | About 70% of long-duration crew show signs of SANS | Eyes explanation | https://ntrs.nasa.gov/api/citations/20230006218/downloads/Brunstetter%20-%20Crewmember%20SANS%20Overview%20-%20Export%20Control%20-FINAL%20-%2001May23.pdf |
| Environment | ISS CO2 held to 4.0 mmHg daily average; symptoms from 2.3 mmHg; headaches above about 3.0 | CO2 bands (`co2Status`) | https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20150019624.pdf |

Challenge resources mapped (exact links are on the challenge Resources tab, not yet copied here):

- **CSA CANS** neutron instrument: dose gauge is labelled "modelled on an onboard neutron dosimeter such as CSA's CANS".
- **Artemis II Immune Biomarkers**: saliva on board, blood immune-cell counts on Earth. Only four subjects, so no prediction claims.
- **B-complex vitamins and SANS**: log B2/B6/B9/B12 intake beside vision checks. One astronaut improved, causation not confirmed. Wording: "intake below plan, top up and re-check", never "B vitamins fix vision".
- **SANS spinal fluid study**: spinal fluid sampling is Earth-only.
- **Menu fatigue**: weekly meal survey on taste, appearance, texture, smell, plus intake and body mass trend.
- **CSA "How does space affect the human body"** infographic: source for region explanations. Layout inspiration only. Our figure is original.

## 4. Demo parameters (every unsourced number)

Anything below shows a "Demo parameter" badge in the app. None is clinical guidance.

| Parameter | Value | Where |
| --- | --- | --- |
| Ground response allowance | 15 min | `verdict.ts` `GROUND_RESPONSE_MIN` |
| Blood pressure window / threshold | 30 min; watch at 2 sd, act at 3 sd above own baseline | `rules.ts` `bp_systolic_high` |
| Heart rate window | 20 min; same sd bands | `hr_high` |
| Blood sugar window | 45 min; same sd bands | `glucose_high` |
| Body temperature window | 60 min; same sd bands | `temp_high` |
| Sleep, mood | No window (monitor only); watch at 1.5 sd below baseline | `sleep_short`, `mood_low` |
| Vision check score | Watch at 2 (1 if cabin CO2 is at or above 2.3 mmHg), act at 4; window 3 days | `eyes_vision_change` |
| Baseline | Mean and sd of the 14 readings before the latest | `baseline.ts` |
| Dose banding | Watch at 50% and act at 80% of the 600 mSv career limit | `bands.ts` `doseStatus` |
| Cross-link thresholds | Last 3 values beyond 1 sd of the earlier baseline | `crosslinks.ts` |
| Menu-fatigue window | 5 days (demo compression of "two weeks") | `crosslinks.ts` `MENU_WINDOW` |
| Simulated dose before day 1 | 20 mSv | `data/regions.ts` |
| Buddy alert tiers | Watch: self top-up. Act: buddy and medical team. Crew decides now: all crew | `engine/escalation.ts` |
| Kit quantities and low-stock levels | Cuff covers 8, glucose strips 20, probe covers 15, water pouches 24 | `data/kit.ts` |
| Pantry stock and days since eaten | Fixed simulated list; menu suggestions use 14 days or more | `data/pantry.ts` |
| Step crew minutes | 2 to 5 min per holding step | `engine/rules.ts` |
| Correlation wording bands | Strong from 0.7, moderate from 0.4, weak from 0.2 (description only) | `engine/stats.ts` |

Honest limits: no action window has a published source. The README frames them as parameters a flight surgeon would set. Sleep has a sourced reference (8.5 h vs about 6 h) but its flag threshold is still a demo value.

## 5. Scenarios

All crew data is simulated (one crew member, 30 days, seeded generator, seed 2026). Scenarios 2, 3 and the extra one start on day 25 and are played with Next day or the clock.

| Scenario | What happens | What it shows |
| --- | --- | --- |
| 1. Blood pressure spike | Systolic jumps to 146 against a baseline of about 119 | Station: consult Earth. Mars: crew decides. Headline demo. |
| 2. Bad week | Mood, sleep fall and dose creeps up over days 26 to 30 | Monitor cards, mood nudge on day 28, immune watch level raised (cross-link) |
| 3. Vision change with high cabin CO2 | CO2 rises 2.4 to 3.3 mmHg, vision score 1, 2, 2, 4, 5 | Eyes amber sooner because of CO2, then red. Verdict stays consult Earth at Mars distance (window is 3 days). Blackout still forces crew decides. |
| Extra: Menu fatigue | Meal ratings and meals eaten fall, B-vitamin intake slips | Nutrition amber, pantry suggestions for meals not eaten recently |

## 6. Cross-links (always labelled "under investigation" in the UI)

- Mood down 3 days, sleep short 3 days and dose rising: immune watch level raised.
- Cabin CO2 at or above 2.3 mmHg and a vision check change: Eyes flagged sooner.
- Meal ratings falling and intake dropping: Nutrition amber ("menu fatigue"), suggest meals not eaten recently from stock.
- Mood down 3 days running: nudge to call home or join a crew activity.
- B-vitamin intake below plan: shown beside the vision check with the "top up and re-check" wording.

## 7. Design decisions and why

- **Decision first.** Most public entries are a vitals dashboard with anomaly alerts and a chatbot. This one makes the decision the product, matching NASA's Earth-Independent Medical Operations (EIMO) framing where ground support is delayed or unavailable.
- **No LLM or network in the decision path.** Pure, unit-tested TypeScript. The app works offline.
- **Personal baseline first.** Readings are judged against the crew member's own last 14 days, because we have no clinical authority to set population thresholds.
- **Status is never colour alone.** Each status has a colour, a symbol and a word.
- **Wording.** "Flag", "re-check", "notify the medical team". Never "diagnose", "treat" or "predict". No drug doses, no calorie targets.
- **Ledger.** An entry is stored when the crew chooses an action. It queues for one one-way delay, a surgeon review travels back with another, and a blackout holds both. State is in memory for now.
- **Figure.** Original flat SVG, not copied or traced from any agency artwork. Tapping a region zooms the figure in on it (turned off for users who prefer reduced motion), with a "Show whole body" button.
- **Hazard tabs.** Five tabs plus "All hazards" filter the same data: region cards, figure regions (others dim), decision cards and the cabin strip. Each tab shows the published figure and its source link. Stomach and immune each belong to two hazards, as in the build spec.
- **Buddy system (team notes).** Every decision card says who is alerted. Watch: you top up and re-check. Act: a simulated buddy (Sam) and the medical team. Crew decides now: all crew, because Earth cannot reply in time. The tier is stored on the ledger entry. These tiers are a demo rule.
- **Supplies and crew time.** Each holding step shows its minutes and the kit items it uses. "Mark done" uses the stock and adds to the day's crew-time tally, and is blocked when the item is out. The pantry suggestions in Nutrition have an "Ate one" button that uses stock.
- **Dot plot.** A scatter of one indicator against another, one dot per day, with the last five days highlighted and a correlation figure. The wording says "relationship in this data" and "under investigation", never that one thing causes the other.

## 8. Limitations to state in the README

- Prototype, not a medical device. All crew data is simulated.
- Action windows and most thresholds are demo parameters.
- Ledger and check-ins are not persisted across reloads yet.
- Region areas without a deep flow (inner ear, immune, bones and muscles) use fixed simulated values. The immune panel only reacts through the cross-link; there is no saliva strip or viral-reactivation flag yet.
- The vision check is a three-question self-report summed into a 0 to 9 score. It is a demo instrument, not a validated vision test.
- The pantry is a fixed simulated list. Taking a step does not yet use up kit or pantry stock (planned for step 7).
- Only one crew member, no accounts. The buddy is a simulated crewmate and no alert is actually sent anywhere.
- Kit, pantry and crew-time tallies are in memory and reset on reload or scenario change.
- The dot plot pairs readings by position. Check-ins appended on one indicator shift its pairing against the others.
- No camera or image input yet.

## 9. AI-use disclosure (for the README)

An AI coding agent (Claude Code) wrote most of the code from a build spec (`HANDOFF.md`) that was itself drafted with AI assistance before the hackathon. The human team directs scope, reviews output, runs the demo and submits. Confirm the exact wording against the 2026 submission and judging guides.

## 10. Team notes (handwritten sheet 1, transcribed by the build agent)

Handwriting was read from a photo, so check this against the sheet. Each note has a status in the build.

| Team note | Status |
| --- | --- |
| Five hazards: space radiation, isolation and confinement, altered gravity, distance from Earth, hostile closed environments | Done. These are our five hazard tags. |
| Health problems: immune changes, bone density loss, cardiovascular event, behavioural health, inadequate nutrition | Covered by Immune, Bones and muscles, Heart, Head, Stomach. Bones is still fixed simulated data. |
| Gather info, identify health indicators, evaluate and act on status | Done: check-ins, six indicators, decision card. |
| Six daily indicators: blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, mood | Done. |
| Buddy system: low level, "top up" alert; chronic low, alert paired buddy or closest person; critical, alert everyone; otherwise "good job, staying healthy" | Done in step 7: three alert tiers on each decision card and the ledger, and the all-clear message reads "Good job, staying healthy". "Chronic" is approximated by act level, since we do not track how long a reading stays low. |
| Display on a clickable human figure that zooms in on the affected area | Done in step 7. |
| Input by text (mood, readings), mouse clicks, camera images (jpg, jpeg, raw, png) | Text and clicks done. Image attach not built (stretch, only if time allows). It would be stored locally and not analysed. |
| Dot plot chart (plot one thing against another) | Done in step 7, framed as "under investigation, not causation". |
| Daily stream in a non-demanding way | Partly: one-tap mood check-in, scenario player standing in for device feeds. |
| SSH, VM web app, 2FA, local storage | Not in the product. The app is static and client-only by design. Local storage is planned for persistence in step 8. SSH, VM and 2FA go in the README as a note on how a real deployment would sit behind crew-network access. |

## 11. Changelog

| When (Dublin) | Step | What changed |
| --- | --- | --- |
| Sat | 1 | Scaffold, verdict engine, seeded generator, mission clock, tests |
| Sat | 2 | Body scan home, region cards, environment bar, cabin strip |
| Sat | 3 | Decision card, live countdown, scenario 1 |
| Sat | 4 | Region detail with trend charts, Heart and Head check-ins, cross-links, scenario 2 |
| Sat | 5 | Decision ledger, blackout hold, surgeon review |
| Sat | 7 | Hazard tabs with published figures and source links, "How this is measured" on each decision card, buddy alert tiers, take-step costs with kit and pantry stock and a crew-time tally, figure zoom, dot plot compare view, tests that every rule source is a link or marked DEMO. Team notes status updated. |
| Sat | 6 | Eyes deep flow (weekly vision check, CO2 cross-link, B-vitamin note), Nutrition panel (daily log, weekly meal survey, menu-fatigue flag, pantry suggestions), radiation gauge, scenario 3 plus the extra menu-fatigue scenario. Added this research doc. |
