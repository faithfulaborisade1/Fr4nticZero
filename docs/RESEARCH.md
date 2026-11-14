# Decision Window: research and decisions log

Living document. Updated whenever a rule, threshold, source, scenario, cross-link or design decision changes (see `CLAUDE.md`). The README is built from this file.

Last updated: Saturday 14 Nov 2026, after adding heart rate and temperature how-to guides.

## 1. What we are building

A static, offline-capable web app for the NASA Space Apps 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions". The home screen summarises priority decisions and body-system status; the body scan and supporting tools have their own pages. Every flagged reading becomes a **decision card** answering: *whose call is this, and by when?*

Pitch: the same reading means "ask Houston" in orbit and "your call" on the way to Mars.

Verdict algorithm (`src/engine/verdict.ts`):

1. `earthReplyMin = 2 * oneWayDelaySec / 60 + GROUND_RESPONSE_MIN` (15 min, demo parameter).
2. Reading ok: no card.
3. No action window, or the rule says "watch": **Monitor**.
4. Blackout, or `earthReplyMin > actionWindowMin`: **Crew decides now**.
5. Otherwise: **Consult Earth, hold meanwhile**, with a countdown.

Worked example (blood pressure, window 30 min): Station reply about 15 min, so consult Earth. Mars at 22 min one way: reply 59 min, so crew decides. The flip happens between 7 and 8 min one way.

## 2. Open items to confirm (not yet verified)

- [ ] Confirm against the official challenge page when available. On 14 November it returned an error; the comparison in `CHALLENGE_AUDIT.md` uses the HackAthlone local event's published challenge text.
- [ ] 2026 Project Submission Guide: demo length, AI-tool disclosure rules.
- [ ] 2026 Judging and Awards Guide: criteria wording (the guide read for the brief carried 2024 dates).
- [ ] Every numerical claim in the source table below must still be checked against the original linked publication. The mission risk guide's general NASA sources have been opened separately.
- [ ] Whether a planning document counts as allowed pre-work (participant FAQ: no work on challenges before the hackathon). Disclose it.
- [x] NASA OSD-575 / LSDS-8 transformed comprehensive metabolic panel selected for a separate historical research view. The source file contains 28 glucose results from four coded participants. The NASA study description lists time points through R+82; the NASA sample metadata and downloaded file also identify R+194 as 194 days after return.
- [x] Correct the challenge-resource list in the README against the HackAthlone page's five listed resources. The official challenge page remains the final authority; older handoff notes about other studies are additional research, not confirmed challenge-listed resources.
- [ ] Check the README's AI-use disclosure wording against the 2026 submission and judging guides.
- [ ] Check the README claims against the final live demo before submitting (the README describes what the app does today).

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

Additional research concepts from the handoff (not verified as challenge-listed resources):

- **CSA CANS** neutron instrument: dose gauge is labelled "modelled on an onboard neutron dosimeter such as CSA's CANS".
- **Artemis II Immune Biomarkers**: saliva on board, blood immune-cell counts on Earth. Only four subjects, so no prediction claims.
- **B-complex vitamins and SANS**: log B2/B6/B9/B12 intake beside vision checks. One astronaut improved, causation not confirmed. Wording: "intake below plan, top up and re-check", never "B vitamins fix vision".
- **SANS spinal fluid study**: spinal fluid sampling is Earth-only.
- **Menu fatigue**: weekly meal survey on taste, appearance, texture, smell, plus intake and body mass trend.
- **CSA "How does space affect the human body"** infographic: source for region explanations. Layout inspiration only. The body illustration was AI-generated for this project.

## 4. Demo parameters (every unsourced number)

Anything below shows a "Demo parameter" badge in the app. None is clinical guidance.

| Parameter | Value | Where |
| --- | --- | --- |
| Ground response allowance | 15 min | `verdict.ts` `GROUND_RESPONSE_MIN` |
| Rover kit | Blood pressure cuff, thermometer and cabin CO2 sensor carried; glucose meter and ultrasound at base | `data/devices.ts` `ROVER_KIT` |
| Routine points | 10 per check-in, 20 for a workout, 1 per crew minute of holding steps; streak counts days with all six check-ins | `state/routine.ts` |
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
| Trend projection settings | Fit on the last 7 readings; flag level is your usual plus 2 sd (1.5 sd for sleep and mood); a trend counts only if clear (slope over 2 standard errors and at least 0.15 sd per day); horizon 14 days; 5 days drawn ahead | `engine/projection.ts`, `engine/rules.ts` |
| Trend watch window | Shows trends reaching the flag level within 7 days | `state/trends.ts` |
| Device list and fallback wording | Five devices with short fallback text | `data/devices.ts` |
| Image limits | Up to 3 per decision, 15 MB each, 320 px preview | `state/attachments.ts` |
| Buddy alert tiers | Watch: self top-up. Act: buddy and medical team. Crew decides now: all crew | `engine/escalation.ts` |
| Kit quantities and low-stock levels | Cuff covers 8, glucose strips 20, probe covers 15, water pouches 24 | `data/kit.ts` |
| Pantry stock and days since eaten | Fixed simulated list; menu suggestions use 14 days or more | `data/pantry.ts` |
| Step crew minutes | 2 to 5 min per holding step | `engine/rules.ts` |
| Correlation wording bands | Strong from 0.7, moderate from 0.4, weak from 0.2 (description only) | `engine/stats.ts` |

Honest limits: no action window has a published source. The README frames them as parameters a flight surgeon would set. Sleep has a sourced reference (8.5 h vs about 6 h) but its flag threshold is still a demo value.

## 5. Scenarios

All mission scenario crew data is simulated (six fictional profiles with separate seeded histories over 30 days; Alex uses seed 2026). The selected scenario’s health event applies to Alex and cabin CO₂ is shared by all crew. Scenarios 2, 3 and the extra one start on day 25 and are played with Next day or the clock.

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

- **Crew workspace.** Six fictional crew members have separately seeded health histories and profile-specific check-ins, decisions, attachments, nudges, workouts and medication entries. The cabin, supplies, equipment, mission clock and environment are shared. The optional server exchanges crew messages and notices using separate access codes; health and medication records remain browser-local. Medication entries have no dosage instructions or reminders. Old single-profile saved state migrates to Alex. Changing a scenario clears all profiles’ health check-ins and decisions and resets shared supplies and equipment, while medication entries, workouts, messages and notices remain; Reset demo clears local records but not server communications.
- **Navigation and scenario controls.** The desktop sidebar can collapse to an icon rail; on phones and tablets the navigation opens as a scrollable menu and closes after a selection. Layouts adapt to the space left by the rail. Simulation controls are in an expandable Mission settings section, and old `#scenario` links open it.
- **Historical research data.** The dedicated research page shows 11 selected measures (308 values) from four public NASA transformed lab files: OSD-575 / LSDS-8 metabolic, immune and cardiovascular serum panels, and OSD-569 / LSDS-7 whole-blood count. It also shows a separate RR-1 ISS sample of 289 original five-minute readings each of temperature, humidity and CO₂ (25 Sep 2014 00:00 through 26 Sep 00:00 UTC), courtesy of NASA’s Environmental Data Application https://visualization.osdr.nasa.gov/eda/ (EDA version not identified in API response). The ISS mission is not Inspiration4, and the observations are not linked to participants. The returned CO₂ values are identical over this interval; this does not establish sensor accuracy. The view presents the paper’s reported 6.7 ± 0.7 hours/night self-reported in-flight sleep and its count of 424 one-hour heart-rate averages across mission phases as published summary context; no individual wearable or sleep records have been loaded. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11357997/.
- The seven source files were downloaded 14 Nov 2026 and preserved under `data/`. SHA-256 hashes are recorded in `scripts/prepare-research-data.py`, which validates every source, sample label, numeric value and telemetry timestamp; `python scripts/prepare-research-data.py --check` verifies the bundled data. OSD-575 DOI https://doi.org/10.26030/mc5d-p710; NASA lists CC0-1.0. The source description lists time points through R+82, while the NASA sample metadata and file also identify R+194 as 194 days after return. Historical data never enters the simulated decision engine and does not validate its demo thresholds.
- **Decision first.** Most public entries are a vitals dashboard with anomaly alerts and a chatbot. This one makes the decision the product, matching NASA's Earth-Independent Medical Operations (EIMO) framing where ground support is delayed or unavailable.
- **No LLM or network in the decision path.** Pure, unit-tested TypeScript. The app works offline.
- **Personal baseline first.** Readings are judged against the crew member's own last 14 days, because we have no clinical authority to set population thresholds.
- **Status is never colour alone.** Each status has a colour, a symbol and a word.
- **Profile vitals.** The header shows the selected profile's latest simulated heart-rate reading with an illustrative animated trace. Oxygen saturation is a fixed fictional example for each profile, not a measurement or an input to decision rules. The trace is not an ECG or a live sensor feed, and reduced-motion settings disable its animation.
- **Check-ins and measurement guides.** A daily page displays six example in-app reminders, completed only by manual check-ins for the selected profile within the current simulated mission day. Pausing the mission clock also pauses the simulated day; there are no background notifications. Public terrestrial references from the American Heart Association, FDA and MedlinePlus supply general measurement examples, not mission-approved or microgravity-validated procedures.
- **Emergency access.** A persistent link offers high-level orientation to alert crew, follow mission procedures and contact medical support. It sends no alert, is not a clinical checklist, and does not create a real flight-surgeon connection.
- **Bones and muscles.** The detail view logs self-reported workout type and duration in the selected profile's browser-local record. The progress display counts entries within the current simulated mission day against an illustrative two-session target. Workout history survives reloads and scenario changes, but is cleared by Reset demo; entries later than a rewound mission clock remain visible in history and do not count yet. Bone status is explicitly not assessed; exercise counts are not bone-density measurements or clinical assessments.
- **Mission health risks.** A dedicated guide uses the selected station, Moon surface or Mars transit environment to present selected hazards, exposure reduction and high-level response planning. Sources are linked per card: NASA's pages on [radiation](https://www.nasa.gov/hrp/hazard-space-radiation/), [radiation protection](https://srag.jsc.nasa.gov/spaceradiation/how/how.cfm), [gravity](https://www.nasa.gov/hrp/hazard-gravity-fields/), [closed environments](https://www.nasa.gov/hrp/hazard-hostile-closed-environments/), [isolation](https://www.nasa.gov/hrp/hazard-isolation-and-confinement/), [distance](https://www.nasa.gov/hrp/hazard-distance-from-earth/) and [celestial dust](https://www.nasa.gov/directorates/esdmd/hhp/risk-of-adverse-health-performance-effects-of-celestial-dust-exposure/). These source pages were opened on 14 Nov 2026. The selection and ordering are editorial, not a validated mission-specific risk ranking; response text directs crews to mission-approved procedures rather than supplying a clinical protocol. Changing the guide's environment also changes the simulation environment.
- **Wording.** "Flag", "re-check", "notify the medical team". Never "diagnose", "treat" or "predict". No drug doses, no calorie targets.
- **Ledger.** An entry is stored for the selected profile when the crew chooses an action. It queues for one simulated one-way delay, a simulated surgeon review travels back with another, and a blackout holds both. Records are stored in the browser; nothing is transmitted.
- **Figure.** AI-generated illustrative 2D male and female human figures with accessible body-region markers; they are not validated anatomical models. The selector changes the image only and does not switch crew members or data. Selecting a region zooms the figure, with a "Show whole body" button. Reduced-motion settings suppress the animation. Radiation status appears in its marker and the body-systems list.
- **Hazard tabs.** Five tabs plus "All hazards" select a shared filter for region cards, figure regions (others dim) and decision cards. The overview always shows all active readings, and the cabin strip remains visible on the trends page. Each tab shows the published figure and its source link. Stomach and immune each belong to two hazards, as in the build spec.
- **Buddy system (team notes).** Every decision card shows a simulated alert tier. Watch: self. Act: the selected profile’s paired simulated buddy and the medical team. Crew decides now: all crew. The tier is stored on that profile’s ledger entry. No alert is actually sent.
- **Supplies and crew time.** Each holding step shows its minutes and the kit items it uses. "Mark done" uses the stock and adds to the day's crew-time tally, and is blocked when the item is out. The pantry suggestions in Nutrition have an "Ate one" button that uses stock.
- **Offline.** The simulated decision path works locally, and a service worker caches the built files on first load. Shared crew messages and notices require the separate crew server and a network connection; the service worker does not cache its API. External source links only open when online.
- **Responsive and accessibility checks.** Browser viewport checks covered the main pages at 320, 375, 768 and 1024 px, including expanded and collapsed desktop navigation; no horizontal page overflow was found in those checks. A previous contrast audit applied to an earlier design and has not been repeated in full. Smooth scrolling and figure zoom respect reduced-motion settings. Not tested with a screen reader or on a physical phone.
- **Trend projection.** A straight line is fitted to the last 7 readings and extended, with an approximate 95% band, to say roughly when a reading would reach its flag level if the trend continued. The flag level uses the baseline from before the 7 readings so a slow drift cannot hide in it. It is a projection, not a prediction, and no machine-learning model is used: with simulated data any model would be trained and tested on data we made up. The final week of generated data is re-ordered so chance runs in random numbers do not start the demo with a warning.
- **Known quirk found while building the projection.** The daily rule check judges a reading against the 14 readings before it, so a slow rise drags its own baseline up and can stay "ok" while the projection (stable baseline) says the reading is already past the flag level. Scenario 4 shows this on purpose. The two can disagree, and the README says so.
- **Equipment failure.** A device panel marks equipment as failed. The cuff, glucose meter and thermometer block their re-measure steps and disable the matching entry field. The cabin CO2 sensor turns the CO2 tile into a watch (we do not know the level) and shows the last good reading. The ultrasound option for attached images is disabled. Each shows a fallback in holding-step wording.
- **Image attach (store and forward).** Up to three photos or scans per decision, chosen before logging. They are saved on the ledger entry and reach the flight surgeon view only after the entry is delivered. Only a 320 px JPEG preview is kept in local storage; camera RAW files are accepted without a preview. Nothing is uploaded or analysed.
- **Dot plot.** A scatter of one indicator against another, one dot per day, with the last five days highlighted and a correlation figure. The wording says "relationship in this data" and "under investigation", never that one thing causes the other.

## 8. Limitations to state in the README

- Prototype, not a medical device. Mission scenario data is simulated; the separate research view contains historical NASA data.
- Action windows and most thresholds are demo parameters.
- Health simulation state is saved in this browser (local storage) and restored on reload, with the clock coming back paused. Reset clears local demo state but not shared server communications. It is a prototype store, not a medical record.
- Region areas without a deep flow include inner ear and immune, which use fixed simulated values. The immune panel only reacts through the cross-link; there is no saliva strip or viral-reactivation flag yet. The bones panel offers a self-reported workout log but no bone-density assessment.
- The vision check is a three-question self-report summed into a 0 to 9 score. It is a demo instrument, not a validated vision test.
- The pantry and kit are fixed simulated lists; marking a step done consumes the relevant kit and eating a meal consumes pantry stock.
- Six fictional crew profiles have separate simulated check-ins, decisions, pending attachments and medication entries. Anyone using the same browser can switch profiles and see those health records. The optional crew server uses separate access codes and stores shared messages and targeted notices; it lacks built-in HTTPS, encryption at rest, background notifications and medical-grade security. Decision-card alert tiers are still simulated and do not send notices automatically. Medication entries are not prescriptions, reminders or a real medical record.
- Heart rate in the profile vitals comes from simulated profile history and check-ins; the displayed SpO₂ is a fixed fictional example. No live heart-rate or oxygen sensor is connected.
- The mission risk guide is educational and cannot detect exposure, replace mission-specific procedures or validate an emergency response. Its highlighted considerations are not ranked by measured mission risk.
- In-app reminders use the simulation clock and are not background or time-sensitive notifications. Measurement examples use public Earth-based references and are not flight-approved procedures; the emergency page cannot send an emergency alert.
- Kit, pantry and crew-time tallies are saved with the rest of the state and reset when the scenario changes or on "Reset demo".
- The dot plot pairs readings by position. Check-ins appended on one indicator shift its pairing against the others.
- Photos and scans can be attached from files; no live camera or ultrasound device is connected.

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
| Input by text (mood, readings), mouse clicks, camera images (jpg, jpeg, raw, png) | Text and clicks done. File image attachment is stored locally and is not analysed; no live camera or ultrasound device is connected. |
| Dot plot chart (plot one thing against another) | Done in step 7, framed as "under investigation, not causation". |
| Daily stream in a non-demanding way | Partly: one-tap mood check-in, scenario player standing in for device feeds. |
| SSH, VM web app, 2FA, local storage | Not in the product. The app is static and client-only by design. Local storage is used for browser-only persistence. SSH, VM and 2FA go in the README as a note on how a real deployment would sit behind crew-network access. |

### New idea from the team (Saturday, after step 9): on-board prediction and equipment failure

The idea: crews heading to Mars cannot wait about 22 minutes each way, so they need fast, on-board tools that work from live data. The team suggested a machine-learning trend model to predict things like high blood pressure, and asked about equipment failure, pre-planned food, and tools for a medical event (ultrasound, drug formulations, preservation). Status: **partly built in step 10** (see the table).

| Part of the idea | Fit with the build | Proposal |
| --- | --- | --- |
| Predict high blood pressure or other basics from live data | Fits the "Earth-independent" pitch. A trained ML model is a validity risk: our data is simulated, so any model would be trained and tested on data we made up, and the build spec cut ML from the decision path. | **Built:** a transparent **trend projection** (least-squares line through the last 7 readings with an approximate 95% band) that says "if this continues, it reaches the flag level in about N days". Runs on the device. Worded as a projection, never a prediction or diagnosis. No ML model. |
| Equipment failure | We already track kit stock. A failed or missing device is not modelled. | **Built:** a **device status** panel (cuff, glucose meter, thermometer, cabin CO2 sensor, ultrasound). A failed device blocks the steps and entry fields that need it, and the card and region show a fallback. A failed CO2 sensor counts as a watch. |
| Pre-planned food | Pantry and menu fatigue exist. No view of how long food lasts. | **Not built.** A **supplies runway** (days of food and key kit left against days to the destination) remains a possible addition. |
| Ultrasound and tools in a medical event | Real-time guidance from Earth is impossible at 22 min, which supports the pitch. Our rule is no treatment instructions. | **Built (images only):** attach up to three photos or scans to a decision. They travel with the ledger entry after the one-way delay (store and forward) and are not analysed. "What each tool can tell you" text is **not built**. |
| Drug formulations and preservation | Needs published stability data we do not have. | Deferred. Not built. |

Figures to check at the source: Moon distance 238,855 miles is about 1.3 s one way for light, while the app uses 3 to 14 s from the NASA comms-delay review. Find out what the review's range includes (relay and processing) before the README leans on it. Mars distance ranges from tens of millions to roughly 250 million miles, which is why the delay runs from a few minutes to 22.

## 11. Changelog

| When (Dublin) | Step | What changed |
| --- | --- | --- |
| Sat | How-to guides 2 | Added heart rate (AHA pulse guidance) and body temperature (MedlinePlus) guides, so all four device-measured indicators have one. The heart-rate re-measure step and the thermometer step on decision cards now open them. |
| Sat | How-to guides | Added animated step-by-step guides for blood pressure and blood sugar (team idea), launched from check-in fields and decision-card steps. General technique from the AHA and FDA sources already cited, with weightlessness notes; not flight procedures. Also gave each indicator and body system its own icon and colour. |
| Sat | Enterprise UI pass | Read the official challenge page and its Resources tab. New design layer: neutral palette, original logo mark, grouped sidebar with icons, collapse and phone drawer, a sticky mission context bar (environment, delay, link, clock, notices, crew switcher, Emergency) and a KPI-led overview. Added a lunar rover environment that carries only part of the kit, a daily routine ring with streak and points (engagement only), and "What it does" and "Why we check it" text for every body region. Checked all 15 pages at 375 px and 768 px for overflow, and contrast on the main pages. |
| Sat | Responsive navigation | Moved scenario controls to Mission settings, preserved the old route, separated phone-menu state from desktop sidebar collapse, and adapted content layouts to available workspace width. Checked main pages at multiple viewport sizes. |
| Sat | Workouts and navigation | Replaced the fixed exercise example with per-profile workout entries, mission-day progress and browser-local history. The two-session target is illustrative and bone health is not assessed. Added check-in URL aliases, stopped unknown fragments from resetting the page and refreshed the offline cache version. |
| Sat | Measurement and emergency support | Added sourced general measurement guides, per-profile in-app check-in reminders, a high-level emergency page and contextual bone and muscle visualization. All remain prototype content; no clinical approval, actual emergency notification or live bone assessment is claimed. |
| Sat | Challenge audit | Compared the product with the local-event publication of the full challenge, corrected the resource list and simulation claims, linked the listed NASA hazard and risk framework in the app, and labelled the AI-generated body illustrations. The official challenge page could not be fetched. |
| Sat | Mission risk guide | Added environment-specific educational health considerations, prevention, high-level response planning and links to NASA sources. No clinical protocol or validated risk ranking is implied. |
| Sat | Profile vitals and communications | Added an illustrative animated heart trace and clearly simulated per-profile vitals. Added an optional crew server for shared messages and targeted notices; the decision-card alerts remain simulated. |
| Sat | Crew workspace | Added six fictional profiles with separate health records, local crew messages, targeted or crew-wide simulated condition notices and profile-specific medication entries. The shared browser has no accounts or actual messaging; old state migrates to Alex. |
| Sat | Expanded research data | Added 11 metabolic, blood-count and immune/cardiovascular lab measures; three separate historical ISS telemetry series; and published sleep/heart-rate summary context, with reproducible source checks. No individual sleep or wearable heart-rate dataset is loaded. |
| Sat | Historical research data | Added a separate NASA Inspiration4 glucose view using the exact 28 transformed OSD-575 results, with provenance, source hash and a reproducible extraction. Mission decisions and scenario data remain simulated. |
| Sat | Resources page | Reorganised the simulated equipment, medical kit, pantry and crew-time views with an at-a-glance status summary; stock and device behaviour are unchanged. |
| Sat | Decision page | Reorganised decision cards into a reading and verdict summary, timing panel, holding steps and decision log. Thresholds, actions and simulated communication are unchanged. |
| Sat | Focused pages | Split the overview, decisions, body scan, mission settings, trends and hazards, ledger, resources, and scenario player into navigable views. The overview shows every active reading regardless of the selected hazard filter. |
| Sat | Navigation | Added sidebar navigation, prioritised the decision card, compacted mission settings and added a female body illustration. The prototype still contains one simulated crew member. |
| Sat | Redesign | Reorganised the dashboard around the body scan and decision card, introduced a new visual system and AI-generated illustrative human figure, preserved interactive region selection and added the figure to the offline cache. |
| Sat | 1 | Scaffold, verdict engine, seeded generator, mission clock, tests |
| Sat | 2 | Body scan home, region cards, environment bar, cabin strip |
| Sat | 3 | Decision card, live countdown, scenario 1 |
| Sat | 4 | Region detail with trend charts, Heart and Head check-ins, cross-links, scenario 2 |
| Sat | 5 | Decision ledger, blackout hold, surgeon review |
| Sat | 10 | Added from the team's new idea: on-board trend projection (chart overlay, trend watch, scenario 4), equipment status panel with blocked steps and fallbacks, and image attach through the ledger. Generator's final week de-trended. README, project notes and this document updated. Not built: supplies runway, per-tool "what it can tell you" text, drug stability. |
| Sat | 9 | README written from this document: pitch first, objective-to-feature map, scenarios, honesty and limitations, sources, resources, beyond-space paragraph, AI-use disclosure, references. No real dataset is loaded and the README says so. |
| Sat | 8 | Local-storage persistence and "Reset demo", offline service worker with manifest and icon (verified with the server stopped), mobile layout audit at 375 px, contrast audit, reduced-motion handling, wording fixes. Fixed a bug where a ticking clock would have blocked saving. |
| Sat | 7 | Hazard tabs with published figures and source links, "How this is measured" on each decision card, buddy alert tiers, take-step costs with kit and pantry stock and a crew-time tally, figure zoom, dot plot compare view, tests that every rule source is a link or marked DEMO. Team notes status updated. |
| Sat | 6 | Eyes deep flow (weekly vision check, CO2 cross-link, B-vitamin note), Nutrition panel (daily log, weekly meal survey, menu-fatigue flag, pantry suggestions), radiation gauge, scenario 3 plus the extra menu-fatigue scenario. Added this research doc. |
