# Decision Window

> **The same reading means "ask Houston" in orbit and "your call" on the way to Mars.**

NASA Space Apps Challenge 2026 entry for *Create Health Monitoring Software for Astronauts on Space Missions*.

**Prototype, not a medical device. Mission scenarios use simulated crew data; the research view displays historical NASA data.**

Decision Window is a health monitor for astronauts that makes the **decision** the product. Every flagged reading becomes one card that answers a single question: **whose call is this, and by when?** It compares the time left to act with the round-trip delay to Earth and says one of three things:

| Verdict | When | What the crew sees |
| --- | --- | --- |
| **Crew decides now** | The link is in blackout, or Earth's reply takes longer than the action window | Holding steps, and a simulated all-crew alert tier |
| **Consult Earth, hold meanwhile** | Earth can reply inside the window | A countdown, and holding steps to follow while waiting |
| **Monitor** | Off baseline, but no action window applies | A re-check time |

A worked example, using the demo values in the app: a high blood pressure reading has a 30 minute action window. On the station Earth can reply in about 15 minutes, so the card says *consult Earth*. On the way to Mars (22 minutes one way) the reply takes about 59 minutes, so the same reading says *crew decides now*.

Most health monitors for this challenge are a dashboard of vitals with alerts. Here the dashboard is only the way in. The product is the decision, which follows NASA's own framing of Earth-independent medical operations, where the hard case is ground support that is delayed or unavailable.

## Try it

Built and tested with Node 22.

```bash
npm install
npm run dev
```

Open the address it prints. The app opens on scenario 1 on the Station.

```bash
npm test           # unit tests for the decision engine and app logic
npm run build      # type-check and build to dist/
npm run preview    # serve the production build locally
```

The health simulation runs in the browser without a server. Shared crew messages and notices use an optional Node service; the decision engine remains local and does not automatically send alerts.

### Shared crew chat and notices

Build and start the service on the computer hosting the crew workspace:

```powershell
npm run build
$env:CREW_HOST = "0.0.0.0"
npm run crew:server
```

Open `http://<host-computer-ip>:8787` on each crew device on the same network. On first start the server creates `crew-credentials.local` with a separate access code for each fictional crew profile. Share each code privately with the person using that profile. They can enter it on Crew messages or Crew notices. Messages reach all signed-in crew; notices are visible to their chosen recipients and their sender, and recipients can mark them read. The app polls while open and saves shared history in `crew-messages.local` on the server. The Vite dev server also proxies crew requests to port 8787 when the service is running.

This is a prototype for test data on a trusted network: the service has no built-in HTTPS, server files are unencrypted, and access codes are not a complete medical security system. It has no background push notifications or guaranteed delivery. Do not use real medical data or rely on it for emergencies. Prior browser-only demo messages are shown separately and are not uploaded. Resetting the demo does not erase shared server history. The host and firewall must allow the devices to connect; no hosted deployment is included.

### The 30-second demo

1. Open the app. The overview shows a raised blood pressure reading and **Consult Earth, hold meanwhile** on the Station.
2. Open **Mission settings** and choose **Mars transit**, then open **Decisions**. The same reading flips to **Crew decides now**, because Earth's reply is longer than the action window.
3. Open **Body scan** and tap the heart. It zooms in and shows the hazard, trends against the crew member's baseline, measurement details and demo badges. On **Trends & hazards**, the **Gravity** tab shows published figures and sources.
4. Return to **Decisions** and mark a holding step done. It shows the crew minutes and kit items it uses, and the **Resources** page updates.
5. Log your choice, then open **Decision ledger**. The entry shows **Queued** while it crosses the link, then **Delivered**. Switch to **Flight surgeon view** and concur. The review travels back with another delay.
6. Open **Real research data** to explore actual Inspiration4 metabolic, blood-count and immune-related measurements and historical ISS cabin telemetry. These research results do not drive the simulated decision cards.

**Reset demo** (under Mission settings → Simulation & scenarios) returns to the opening state and clears the simulated profiles’ local logs, workouts, messages and notices (not shared server history). Changing scenarios clears all profiles’ health check-ins and decisions and resets shared resources, but preserves medication entries, workout history, messages and notices. Workouts use the simulated mission clock; a scenario change can rewind that clock, so later entries remain in the history but do not count toward the current day. Health simulation state remains in the browser across reloads; shared communications are saved on the crew server.

## How it maps to the challenge

The table maps the [official challenge page](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/) (read on 14 November 2026) to the current prototype. See [the challenge audit](docs/CHALLENGE_AUDIT.md) for gaps and submission checks.

| Challenge objective | Where it is in the app |
| --- | --- |
| Gather indicators and let astronauts evaluate and decide | Daily check-in forms feed the decision cards |
| A visual way to assess their own health | Body scan page with colour-coded regions |
| Guidance on treatments and improvements | Partial: demo "Do this now" holding steps and health-improvement context; no clinically validated treatment or emergency procedures |
| Input by keyboard, mouse or other means | Forms and one-tap scales, plus a scenario player standing in for device feeds |
| The six named indicators: blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, mood | One tile, one trend chart and one rule each (heart, head and skin areas) |
| Explain what can be measured in space and what needs Earth | "How this is measured" panel on every region and every decision card |
| Show how spaceflight hazards affect indicators | Hazard tags, five hazard tabs with published figures, and a dot plot of one indicator against another |
| Identify when the crew or flight surgeons should pay attention | The verdict, the buddy alert tiers and the decision ledger with surgeon review |
| Suggest actions that prevent a critical condition | Holding steps with their crew-time and supply cost, and an on-board trend watch that projects a slow drift days ahead |
| An interactive human figure with clickable parts that shows each part's function and health status | The body scan: tap a region and it zooms in, then shows what that part does, why it is checked in space, and its status against the crew member's own baseline |
| Which measurements can be done in space, and why an exam is needed | "Why we check it in space" and "How this is measured" (on board / needs Earth) on every region |

Optional considerations addressed include several environments (space station, Moon surface base, a lunar rover that carries only part of the medical kit, and Mars transit with a delay slider and a blackout toggle), dynamic charts, colour coding paired with a symbol and a word, plain-language explanations, an in-app daily routine with reminders, and light gamification: a daily routine ring, a streak of full check-in days and points for logging habits (points are engagement only, not a health score). There are no background notifications.

### What is in the app

- **Real research data:** a separate, labelled view of 11 historical laboratory measures (308 values) for four coded Inspiration4 participants, from NASA OSD-569 / LSDS-7 and OSD-575 / LSDS-8. It also shows 867 original five-minute ISS cabin temperature, humidity and CO₂ observations from 25 September 2014 to 00:00 UTC on 26 September, from NASA’s Environmental Data App (EDA) RR-1 mission. These are different missions and are not person-matched. Published Inspiration4 sleep and heart-rate summary findings are shown separately; underlying individual heart-rate and sleep data have not been loaded. None of these data feed the simulated decision engine.

- **Body scan:** nine tracked areas on interactive, AI-generated illustrations, selected by fictional crew profile. Each profile has its own simulated readings and check-ins. Radiation status is available as a body-map marker and in the body-systems list. Heart, Head and Eyes have full flows, Nutrition a medium one, and Immune, Bones and muscles, Inner ear, Skin and the radiation gauge are shorter.
- **Crew workspace:** six fictional profiles with separate simulated health histories, check-ins, decisions, attachments and medication logs; a shared message board and targeted or crew-wide notices through an optional crew server. Health and medication records remain local and have no browser access controls. Medication entries are notes and status marks, not prescriptions or reminders.
- **Profile vitals:** an animated illustrative heartbeat and the latest simulated heart-rate reading for the selected profile. The oxygen percentage is a fixed example per profile; neither the animation nor oxygen is a live sensor feed, and oxygen does not drive decision cards.
- **Mission health risks:** a NASA-sourced educational guide to selected considerations for the station, Moon surface and Mars transit, with prevention and response planning and links to the original sources. Changing the environment also updates the simulation's mission settings. It is not a ranked risk assessment or an emergency procedure.
- **Daily check-ins and measurement guides:** six in-app reminders track manual entries for the selected profile within the simulated mission day. Public measurement guidance is linked on the check-in forms; it is general Earth-based reference information, not flight-approved instructions. The reminders do not send notifications when the app is closed.
- **Emergency access:** a persistent link brings up high-level steps to alert the crew and use approved mission procedures and communication. The link does not send an alert, and the page is not a clinical emergency checklist.
- **Bones and muscles:** log workout type and duration for each selected profile; the current mission-day count updates the example two-session progress display. Entries are saved in this browser and are not synced between devices. The target is illustrative, and neither workouts nor the display assess bone density or determine clinical status.
- **Mission context bar:** always visible at the top: environment, one-way delay and Earth reply time, link status (or blackout), the simulated mission clock with play and pause, crew notices and a crew profile menu. Emergency support is a red button at the bottom of the sidebar, and moves to the top bar on phones, where the sidebar folds away.
- **Distance from Earth:** environment selector (station, Moon surface, lunar rover, Mars transit), one-way delay, blackout toggle and the Earth reply time.
- **Lunar rover:** uses the lunar relay delay, but only the blood pressure cuff, thermometer and CO2 sensor travel with the crew. The glucose meter and ultrasound are shown as at base, steps that need them are blocked, and the card gives an at-base fallback.
- **Daily routine (light gamification):** a progress ring for six check-ins and a workout, a streak of full check-in days and points for logging habits, on the overview and the check-ins page.
- **Closed environment strip:** cabin CO2, temperature, pressure and noise.
- **Decision cards:** verdict, the reason in one line, countdown, who is alerted, holding steps, source and demo badges.
- **Decision ledger:** every logged choice queues for one one-way delay, then delivers. A flight surgeon view can concur or overrule, and the review travels back. A blackout holds both.
- **Hazard tabs:** Radiation, Isolation, Distance, Gravity and Environment show context and sources and filter the body scan and decision cards. The overview always shows all active readings.
- **Supplies and crew time:** each step shows its minutes and the kit items it uses. Marking it done uses stock and adds to the day's crew-time tally.
- **On-board trend watch:** a straight-line projection of the last 7 readings that says when an indicator would reach its flag level if the trend continued. It also draws as a dashed line on the trend charts. It runs on the device with no Earth link, and is worded as a projection, never a prediction.
- **Equipment status:** mark the blood pressure cuff, glucose meter, thermometer, cabin CO2 sensor or ultrasound as failed. Steps that need it are blocked, the entry field is disabled, the card shows a fallback, and a failed CO2 sensor is treated as a watch rather than "ok".
- **Image attach (simulated store and forward):** attach up to three photos or ultrasound scans (JPG, PNG, WebP or camera RAW) to a decision. Their previews appear in the local simulated flight-surgeon view after the demo delay; no image is sent to Earth or analysed.
- **Dot plot:** one indicator against another, with the correlation described as a pattern in the data, never a cause.
- **Simulation & scenarios:** a collapsible section in Mission settings contains the mission clock (play, pause, next day, speed) and the scenarios below. Existing `#scenario` links open this section.

### Scenarios (all simulated, six fictional crew profiles, 30 days, seeded)

| Scenario | What it shows |
| --- | --- |
| 1. Blood pressure spike | Station: consult Earth. Mars: crew decides. The headline demo. |
| 2. Bad week | Mood and sleep fall over five days. A nudge appears, and the Immune area is flagged (under investigation). |
| 3. Vision change with high cabin CO2 | The Eyes go amber sooner because of the CO2, then red. The verdict stays consult Earth even at Mars distance, because vision changes build over weeks. |
| 4. Slow blood pressure drift | Blood pressure creeps up about a point a day. The trend watch warns days ahead ("in about 4 days", then "in about 2") while the daily rule check stays quiet. |
| Extra: Menu fatigue | Meal ratings and intake fall. Nutrition is flagged and suggests meals not eaten recently. |

## Honesty and limitations

This is a prototype built in a weekend. Please read it that way.

- **Not a medical device.** It gives decision support wording only: "flag", "re-check", "notify the medical team". It never diagnoses or treats, and there are no drug doses or calorie targets. The only forward-looking feature is the trend projection, which extends a straight line through the last 7 readings, says so, and carries a Demo badge. **No machine-learning model is used**: with simulated data a trained model could not be honestly validated.
- **Mission scenario data is simulated.** Six fictional crew profiles with seeded histories, a shared cabin, fixed pantry and kit. The scenario event follows Alex. The separate research view contains historical public NASA data from real Inspiration4 participants and is not connected to the fictional profiles. Entries in the local demo are stored in the browser; do not use it as a real medical record.
- **Action windows and most thresholds are demo parameters.** No published source gives an action window in minutes. They carry a visible **Demo parameter** badge wherever they drive the screen, and are framed as values a flight surgeon would set. Readings are judged against the crew member's own last 14 days, because we have no clinical authority to set population thresholds.
- **Published figures anchor the gauges only** (radiation limits, CO2 bands, the sleep gap, communication delays). They are listed below with their sources.
- **Cross-links between hazards are labelled "under investigation".** They are flags, not findings.
- **The vision check is a demo instrument.** It is a three-question self-report summed into a 0 to 9 score, not a validated vision test.
- **Decision-card buddy alerts are simulated.** Shared messages and notices require the optional crew server and are sent to signed-in crew; they are not emergency notifications. The six profiles and health data remain fictional, and health records have no browser access controls.
- **Measurement and emergency guidance is not mission-approved.** Public terrestrial measurement instructions are educational references; real flight procedures depend on the mission and equipment. The emergency page does not send an alert, contact ground or provide a validated medical procedure.
- **The projection and the daily check can disagree.** The daily rule check judges a reading against the last 14 days, which move with the readings, so a slow drift can slip past it. The projection uses the baseline from before its window and is meant to catch that, but that is also a demo choice and it can raise false alarms.
- **Equipment failure is simulated.** The device list and fallback wording are demo content, not clinical guidance, and a failed device is a switch you set, not something detected.
- **Images are not analysed.** Only a small preview is kept, in your browser, and nothing is uploaded. Camera RAW files are accepted but show no preview. The ultrasound option is a label on an image you choose, not a connection to a real device.
- The human figures are illustrative AI-generated 2D images, not an anatomical or diagnostic reference.
- **Historical data is separate.** The research view uses Inspiration4 laboratory measurements, historical ISS telemetry and published study summaries, not live telemetry. It does not validate or feed the demo decision engine.
- **Offline needs one online visit first** to cache the app. External source links open only online.
- **Not tested with a screen reader or on a physical phone.** Browser viewport checks covered the main pages at 320, 375, 768 and 1024 px, including the desktop sidebar's expanded and collapsed states. This is not a full accessibility or physical-device audit.

The full working notes, including every demo parameter and where it lives in the code, are in [docs/RESEARCH.md](docs/RESEARCH.md).

## Sources

Published figures used to anchor gauges and flags. They are quoted from the linked material as gathered in the team's research. Please confirm each at its link before relying on it.

| Hazard | Figure | Used for | Source |
| --- | --- | --- | --- |
| Radiation | Career limit under 600 mSv; 250 mSv per solar particle event | Dose gauge and bands | [NASA OCHMO radiation protection brief](https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf) |
| Isolation | 8.5 h of sleep scheduled, about 6 h achieved on ISS missions | Sleep chart reference lines | [Barger et al., Lancet Neurology 2014 (news release)](https://www.eurekalert.org/news-releases/541449) |
| Isolation and immune | Herpes viruses shed by 53% of shuttle and 61% of ISS astronauts | Context for the immune watch level | [Report on Mehta et al. 2019](https://bigthink.com/surprising-science/herpes-astronauts) |
| Distance | Mars up to 22 min one way (44 min round trip); Moon 3 to 14 s one way | Environment slider, Earth reply time | [NASA Human Health and Performance](https://ntrs.nasa.gov/api/citations/20230015521/downloads/Human%20Health%20and%20Performance.pdf), [NASA comms-delay review](https://ntrs.nasa.gov/citations/20250000703) |
| Gravity (bone) | About 1 to 1.5% bone mineral loss per month without countermeasures | Bones and muscles explanation | [NASA OCHMO bone loss brief](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-030-bone-loss.pdf) |
| Gravity (eyes) | About 70% of long-duration crew show signs of SANS | Eyes explanation | [NASA: Crewmember SANS overview](https://ntrs.nasa.gov/api/citations/20230006218/downloads/Brunstetter%20-%20Crewmember%20SANS%20Overview%20-%20Export%20Control%20-FINAL%20-%2001May23.pdf) |
| Environment | ISS CO2 held to a 4.0 mmHg daily average; symptoms from 2.3 mmHg; headaches above about 3.0 | Cabin CO2 bands | [NASA: CO2 on the ISS](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20150019624.pdf) |

### Challenge resources

The local event's published challenge page lists five resources. The official challenge page is the final authority; the NASA OSD and ISS datasets in this project are additional resources.

- [NASA: Five Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) and [NASA: Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/): the hazard taxonomy and context used by the hazard views and mission risk guide.
- [NASA: Ongoing HRP Research in Space](https://www.nasa.gov/hrp/ongoing-hrp-research/): further reading on ongoing human research.
- [CSA: Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp): context for radiation monitoring, including CANS. The app's readings are simulated.
- [CSA: Why Do We Conduct Science Experiments in Space?](https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp): context on space research.

## Beyond space

The question "whose call is this, and by when?" applies wherever a doctor is far away or slow to reach: ships at sea, polar and remote research stations, expeditions, and rural clinics. The same comparison of time left against time to get help works there with different numbers, and the crew-time and supply costs matter just as much.

## How it is built

Vite, React, TypeScript, Tailwind CSS, Recharts and Vitest, with an optional Node crew communications server. Health simulation state is saved in browser local storage; shared messages and notices are stored on the server. A small service worker caches the build for offline simulation use.

```
src/
  engine/   verdict, baseline, rules, cross-links, buddy tiers, trend projection, hazard bands (pure, unit-tested)
  data/     seeded generator, scenarios, regions, hazards, kit, pantry, devices
  state/    mission clock, ledger, supplies, history, trends, image attachments, saved state
  ui/       body scan, decision card, ledger, charts, forms
public/     service worker, manifest, icon
docs/       research and decisions log
```

The decision engine is plain TypeScript with no network access. No LLM or external API is in the decision path.

Design choices worth knowing: status is never shown by colour alone (each has a symbol and a word), tap targets are large, and the layout works on a phone and a projector.

## AI-use disclosure

AI coding agents (Claude Code by Anthropic and Codex by OpenAI) wrote and redesigned code in this repository, working from a build specification that was itself drafted with AI assistance before the build began. The team set the concept, scope and research, reviewed the output, runs the demo and made the submission. The test suite and the checks described above were also run by the agent. Anything the agent could not verify, including the source figures, is marked as such in [docs/RESEARCH.md](docs/RESEARCH.md).

## References

**Data and sources.** Mission scenario data is simulated. The separate research view uses NASA OSD-569 / LSDS-7 whole-blood counts and [NASA OSD-575 / LSDS-8](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575) serum panels for the Inspiration4 mission, plus 25 September 2014 ISS RR-1 telemetry courtesy of [NASA’s Environmental Data Application](https://visualization.osdr.nasa.gov/eda/) (EDA version not identified in the API response). The EDA sample ends at 00:00 UTC on 26 September and consists of 289 five-minute observations each for temperature, humidity and CO₂; the returned CO₂ values are identical for this interval and this does not establish sensor accuracy. The ISS data are not associated with the Inspiration4 participants. The view also quotes published aggregate sleep and heart-rate context from the [Inspiration4 research paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC11357997/); no individual wearable or sleep time series are included.

The original NASA files are preserved under `data/` and were retrieved on 14 Nov 2026. `python scripts/prepare-research-data.py --check` verifies the 308 lab values and 867 telemetry observations against the checked-in source hashes. The OSD-575 study summary lists sample dates through R+82; NASA’s sample metadata and the transformed files also identify R+194 as 194 days after return. The published figures and challenge resources are listed under Sources.

**Code.** [React](https://react.dev), [Recharts](https://recharts.org), [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com), [TypeScript](https://www.typescriptlang.org), [Vitest](https://vitest.dev).

**Assets.** The human figures are AI-generated illustrative 2D images, not a validated anatomical model. The app icon is an original SVG made for this project. Region icons are standard emoji drawn by the user's system fonts. No fonts, images or datasets are loaded from the network at runtime; NASA data is bundled for the research view.

**Tools.** Claude Code and Codex were used to write and test the code; OpenAI image generation was used for the human illustration.
