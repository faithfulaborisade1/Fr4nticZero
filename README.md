# Decision Window

> **The same reading means "ask Houston" in orbit and "your call" on the way to Mars.**

NASA Space Apps Challenge 2026 entry for *Create Health Monitoring Software for Astronauts on Space Missions*.

**Prototype, not a medical device. All crew data is simulated.**

Decision Window is a health monitor for astronauts that makes the **decision** the product. Every flagged reading becomes one card that answers a single question: **whose call is this, and by when?** It compares the time left to act with the round-trip delay to Earth and says one of three things:

| Verdict | When | What the crew sees |
| --- | --- | --- |
| **Crew decides now** | The link is in blackout, or Earth's reply takes longer than the action window | Holding steps, and everyone on the crew is alerted |
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

It is a static, client-only app. There is no backend, no account and no network call in the decision path. Any static host works: build with `npm run build` and publish `dist/` (on Vercel the defaults are right).

### The 30-second demo

1. Open the app. The Station is selected and a raised blood pressure reading shows **Consult Earth, hold meanwhile**.
2. Choose **Mars transit**. The same reading flips to **Crew decides now**, and the card explains why: Earth's reply is longer than the action window.
3. Tap the heart on the figure. It zooms in and shows the hazard, the trends against the crew member's own baseline, what is measured on board and what needs Earth, and the Demo badge on its thresholds. The **Gravity** hazard tab shows the published figures and their sources.
4. On the card, mark a holding step done. It shows the crew minutes and the kit items it uses, and the supplies panel updates.
5. Log your choice. The ledger entry shows **Queued** while it crosses the link, then **Delivered**. Switch to **Flight surgeon view** and concur. The review travels back with another delay.

**Reset demo** (in the scenario player) returns to the opening state. The app remembers what you did across reloads, in your browser only.

## How it maps to the challenge

Every objective has a visible feature. (The objectives below come from the team's reading of the challenge page.)

| Challenge objective | Where it is in the app |
| --- | --- |
| Gather indicators and let astronauts evaluate and decide | Daily check-in forms feed the decision cards |
| A visual way to assess their own health | Body scan home screen with colour-coded regions |
| Guidance on treatments and improvements | "Do this now" holding steps on every card |
| Input by keyboard, mouse or other means | Forms and one-tap scales, plus a scenario player standing in for device feeds |
| The six named indicators: blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, mood | One tile, one trend chart and one rule each (heart, head and skin areas) |
| Explain what can be measured in space and what needs Earth | "How this is measured" panel on every region and every decision card |
| Show how spaceflight hazards affect indicators | Hazard tags, five hazard tabs with published figures, and a dot plot of one indicator against another |
| Identify when the crew or flight surgeons should pay attention | The verdict, the buddy alert tiers and the decision ledger with surgeon review |
| Suggest actions that prevent a critical condition | Holding steps with their crew-time and supply cost, and an on-board trend watch that projects a slow drift days ahead |
| An interactive human figure with clickable parts | The body scan: tap a region and it zooms in |

Optional considerations also covered: several environments (Station, Moon surface, Mars transit with a delay slider and a blackout toggle), dynamic charts, colour coding that is always paired with a symbol and a word, plain language, and a check-in routine.

### What is in the app

- **Body scan:** nine tracked areas around an original astronaut figure, with the whole-figure outline tinted by radiation dose status. Heart, Head and Eyes have full flows, Nutrition a medium one, and Immune, Bones and muscles, Inner ear, Skin and the radiation gauge are shorter.
- **Distance from Earth:** environment selector, one-way delay, blackout toggle and the Earth reply time.
- **Closed environment strip:** cabin CO2, temperature, pressure and noise.
- **Decision cards:** verdict, the reason in one line, countdown, who is alerted, holding steps, source and demo badges.
- **Decision ledger:** every logged choice queues for one one-way delay, then delivers. A flight surgeon view can concur or overrule, and the review travels back. A blackout holds both.
- **Hazard tabs:** Radiation, Isolation, Distance, Gravity and Environment filter the figure, cards and decisions.
- **Supplies and crew time:** each step shows its minutes and the kit items it uses. Marking it done uses stock and adds to the day's crew-time tally.
- **On-board trend watch:** a straight-line projection of the last 7 readings that says when an indicator would reach its flag level if the trend continued. It also draws as a dashed line on the trend charts. It runs on the device with no Earth link, and is worded as a projection, never a prediction.
- **Equipment status:** mark the blood pressure cuff, glucose meter, thermometer, cabin CO2 sensor or ultrasound as failed. Steps that need it are blocked, the entry field is disabled, the card shows a fallback, and a failed CO2 sensor is treated as a watch rather than "ok".
- **Image attach (store and forward):** attach up to three photos or ultrasound scans (JPG, PNG, WebP or camera RAW) to a decision. They travel with the ledger entry after the same delay, so Earth sees them when the entry is delivered. They are not analysed.
- **Dot plot:** one indicator against another, with the correlation described as a pattern in the data, never a cause.
- **Scenario player:** a mission clock (play, pause, next day, speed) and the scenarios below.

### Scenarios (all simulated, one crew member, 30 days, seeded)

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
- **All crew data is simulated.** One crew member, a seeded generator, a fixed pantry and kit. No real person's data is used or collected.
- **Action windows and most thresholds are demo parameters.** No published source gives an action window in minutes. They carry a visible **Demo parameter** badge wherever they drive the screen, and are framed as values a flight surgeon would set. Readings are judged against the crew member's own last 14 days, because we have no clinical authority to set population thresholds.
- **Published figures anchor the gauges only** (radiation limits, CO2 bands, the sleep gap, communication delays). They are listed below with their sources.
- **Cross-links between hazards are labelled "under investigation".** They are flags, not findings.
- **The vision check is a demo instrument.** It is a three-question self-report summed into a 0 to 9 score, not a validated vision test.
- **The buddy is a simulated crewmate.** No alert is sent anywhere.
- **The projection and the daily check can disagree.** The daily rule check judges a reading against the last 14 days, which move with the readings, so a slow drift can slip past it. The projection uses the baseline from before its window and is meant to catch that, but that is also a demo choice and it can raise false alarms.
- **Equipment failure is simulated.** The device list and fallback wording are demo content, not clinical guidance, and a failed device is a switch you set, not something detected.
- **Images are not analysed.** Only a small preview is kept, in your browser, and nothing is uploaded. Camera RAW files are accepted but show no preview. The ultrasound option is a label on an image you choose, not a connection to a real device.
- **No real dataset is loaded.** We did not use NASA's Open Science Data Repository in this version.
- **Offline needs one online visit first** to cache the app. External source links open only online.
- **Not tested with a screen reader or on a physical phone.** Layout and contrast were checked with scripts at 375 px wide.

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

These were supplied with the challenge and shaped the design:

- **CSA CANS neutron instrument.** The radiation gauge is labelled "modelled on an onboard neutron dosimeter such as CSA's CANS".
- **Artemis II Immune Biomarkers study.** Saliva can be tested on board, blood immune-cell counts need an Earth lab. The study had four subjects, so we make no prediction claims.
- **B-complex vitamins and SANS.** B-vitamin intake is logged beside the vision check. One astronaut improved and causation is not confirmed, so the wording is "intake below plan, top up and re-check".
- **SANS spinal fluid study.** Spinal fluid sampling is listed as Earth-only.
- **Menu fatigue work.** A weekly meal survey (taste, appearance, texture, smell) with intake and body mass trends.
- **CSA "How does space affect the human body" infographic.** Used as a source for region explanations and as layout inspiration only. Our astronaut figure is original and is not copied or traced from it.

## Beyond space

The question "whose call is this, and by when?" applies wherever a doctor is far away or slow to reach: ships at sea, polar and remote research stations, expeditions, and rural clinics. The same comparison of time left against time to get help works there with different numbers, and the crew-time and supply costs matter just as much.

## How it is built

Vite, React, TypeScript, Tailwind CSS, Recharts and Vitest. No backend. State is saved in the browser's local storage, and a small service worker caches the build so it runs with the network off.

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

An AI coding agent (Claude Code, by Anthropic) wrote most of the code in this repository, working from a build specification that was itself drafted with AI assistance before the build began. The team set the concept, scope and research, reviewed the output, runs the demo and made the submission. The test suite and the checks described above were also run by the agent. Anything the agent could not verify, including the source figures, is marked as such in [docs/RESEARCH.md](docs/RESEARCH.md).

## References

**Data and sources.** All crew data is simulated. The published figures and the challenge resources are listed under Sources. No external dataset is loaded.

**Code.** [React](https://react.dev), [Recharts](https://recharts.org), [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com), [TypeScript](https://www.typescriptlang.org), [Vitest](https://vitest.dev).

**Assets.** The astronaut figure and app icon are original SVG made for this project. Region icons are standard emoji drawn by the user's system fonts. No fonts, images or datasets are loaded from the network.

**Tools.** Claude Code was used to write and test the code.
