# Decision Window: 3-minute pitch script and Q&A

Deck: 7 slides (the Space Apps guidance the team found allows up to seven). Speaker notes in the deck repeat these lines. The live demo is https://decision-window.vercel.app. Still to fill: `[Presenter A/B/C]` names, plus `[Local event]` on slide 1 and `[backup video link]` on slide 5.

## Who says what

| Time | Slide | Presenter | Job |
| --- | --- | --- | --- |
| 0:00 – 0:15 | 1 Cover | [Presenter A] | Hook: the same reading, two answers |
| 0:15 – 0:35 | 2 Problem | [Presenter A] | Five hazards, the crew is the first responder, 44 minutes |
| 0:35 – 1:00 | 3 How it works | [Presenter B] | One comparison, three verdicts |
| 1:00 – 2:00 | 5 Live demo | [Presenter B] | Station → Mars flip, heart, ledger (skip slide 4, or show it while the app loads) |
| 2:00 – 2:20 | 6 Why trust it | [Presenter C] | NASA grounding, honesty, offline |
| 2:20 – 2:35 | 7 Close | [Presenter C] | Beyond space, next steps, thank you |
| 2:35 – 3:00 | | | Buffer: about 25 seconds. Don't fill it. |

If there is no live demo slot, Presenter B uses slide 4 (Product) for 20 seconds in place of the demo, and the team ends early.

## Script

**[Presenter A], slide 1 (15 s).**
“Hi, we’re Team Fr4nticZero. On the space station, if an astronaut’s blood pressure spikes, a flight surgeon is a few minutes away. On the way to Mars, the answer can take almost an hour. Our app, Decision Window, is built on one idea: the same reading means *ask Houston* in orbit, and *your call* on the way to Mars.”

**[Presenter A], slide 2 (20 s).**
“NASA’s Human Research Program maps five hazards: radiation, isolation, distance, gravity and a closed cabin. Together they cause immune changes, bone loss, heart problems and behavioural health issues. The challenge says it plainly: on long missions, the crew is the first responder. At Mars’s farthest, a message takes 22 minutes each way, so it’s 44 minutes before a doctor can even reply. Dashboards show what changed. None tells the crew whose call it is, or by when.”

**[Presenter B], slide 3 (25 s).**
“Every flagged reading gets one comparison: how long we have to act, against how long Earth needs to reply. That’s twice the signal delay plus the ground team’s response. If Earth can’t answer in time, or the link is down, the crew decides now and everyone is alerted. If it can, the crew holds with clear steps and a countdown. If the reading is only off the person’s own baseline, we monitor. Same blood pressure reading: on the station, consult Earth. On the way to Mars, your call. Let me show you.”

**[Presenter B], slide 5, live demo (60 s).**
1. *(Overview, Station)* “Commander Alex has a blood pressure spike. The app says consult Earth: 30 minutes to act, and Earth replies in 15.”
2. *(Click the environment chip in the top bar, then Mars transit.)* “Same reading, on the way to Mars. Earth needs 59 minutes. It’s the crew’s call, and the whole crew is alerted.”
3. *(Body scan, tap the heart.)* “Every body part tells you what it does, why we check it in space, and its trend against Alex’s own baseline.” *(Decisions.)* “Holding steps, each with crew time and kit cost.” *(Mark one done.)*
4. *(Click “I will follow the holding steps”.)* “The choice queues behind the real 22-minute delay.” *(Decision ledger, Flight surgeon view, Concur.)* “And the surgeon’s answer comes back the same way.”

**[Presenter C], slide 6 (20 s).**
“Three reasons to trust it. It’s grounded in NASA’s framework: the five hazards, the human-risk list, CSA’s radiation work, and real Inspiration4 and ISS data, kept separate from the simulation. It’s honest: every number we couldn’t source carries a Demo badge, the rules are readable, and trends are projections, not predictions. And it works where it’s needed: offline, on any screen, with 140 automated tests behind it.”

**[Presenter C], slide 7 (15 s).**
“Every crew far from help faces the same question: whose call is it, and by when? That’s true on a ship, at a polar station or in a rural clinic. Next we’d connect real sensors, let flight surgeons set the windows, and validate the rules with clinicians. Decision Window. Thank you.”

## Before you go on (2 minutes)

- [ ] Open https://decision-window.vercel.app on the presenting laptop and load it once online, so it also works offline. Don’t demo Messages or Notices from this link.
- [ ] Mission settings → Simulation & scenarios → **Reset demo**. Check: Station, scenario 1, Overview shows “Consult Earth, hold meanwhile”.
- [ ] In the same panel set **Speed** to **10 min / s**, so the 22-minute delivery and the surgeon review each take about 2 seconds on stage. Leave the clock paused; logging a choice starts it.
- [ ] Browser zoom so the top bar and Overview fit the projector. Close other tabs and notifications.
- [ ] The backup video is open in a second tab.
- [ ] One person owns the clicker and the laptop; the speaker doesn’t share it.

## If the demo breaks

Say “here’s the recording” and play the backup. Don’t debug on stage. If the app is up but the Mars switch fails, use Mission settings → Mars transit. If the ledger is slow, skip the surgeon step and say “the review comes back with the same delay”.

## Likely questions, and short answers

**1. Is this medically valid? Who sets the thresholds?**
It’s a prototype decision-support tool, not a medical device. Readings are judged against each person’s own 14-day baseline, and every threshold or action window we couldn’t source carries a visible Demo badge. In real use, flight surgeons would set the action windows. That’s the point of making them parameters.

**2. Why not use machine learning or AI to predict problems?**
Our data is simulated, so any model would be trained and tested on numbers we made up, and we couldn’t honestly validate it. We used readable rules and a simple straight-line trend projection that shows its basis (the last 7 readings) and is labelled a projection, not a prediction. With real crew data, a validated model could replace the projection.

**3. Where does the data come from?**
In the demo, a seeded simulation for six fictional crew members, plus manual check-ins by keyboard, tap or camera image. The engine takes any reading with a value and a time, so a cuff, glucose meter or wearable could feed it later. Separately, a research page shows real historical NASA data from Inspiration4 lab results and ISS cabin telemetry. It is never fed into the decisions.

**4. What makes this different from a health dashboard?**
Dashboards stop at “this reading is high”. We add the next question: whose call is it, and by when? The same reading gets a different answer at the station, on the Moon, on a rover or on the way to Mars, and the crew sees why.

**5. Why 15 minutes for the ground team to respond?**
It’s a demo parameter for how long a flight surgeon needs to read and reply, and it’s badged as one. The Earth reply time is twice the one-way signal delay plus that allowance. A mission would set its own value.

**6. What happens in a real emergency, like a cardiac arrest?**
That’s outside a decision-support tool: the crew follows the mission’s approved emergency procedures. The app has an always-visible Emergency button that points to those steps, and it never replaces them. Our engine covers the much more common grey zone, where a reading is worrying and someone has to decide who acts.

**7. Does the buddy alert actually notify anyone?**
Not in the prototype. The tiers (self, then buddy and medical team, then the whole crew) are shown and recorded in the ledger, and a separate crew notice board can send notices through an optional local server. Real alerting would hook into the spacecraft’s own systems.

**8. How does it work without the internet?**
It’s a static web app with a service worker. After one online visit it runs fully offline, and no network call is in the decision path. That matters, because a tool that needs the cloud defeats its own purpose 22 light-minutes from Earth.

**9. What about the privacy of astronaut health data?**
Everything stays on the device in the browser’s local storage; nothing is uploaded, and attached images are never analysed or sent. A real deployment would sit behind the spacecraft network’s access controls and add accounts. The prototype has no logins, and we say so.

**10. Why a personal baseline instead of normal ranges?**
Astronauts are fit and spaceflight shifts what’s normal, so a population range can miss a meaningful change for one person. A personal baseline catches a change early. We also show published NASA figures where they exist, such as cabin CO2 bands and radiation limits.

**11. Can the trend projection give false alarms?**
Yes, and we say so. It only reports a trend when the slope is clearly larger than the noise, and it never creates a decision card on its own. It is an early nudge to re-check.

**12. What is the rover mode?**
On a lunar rover traverse the crew only carries part of the kit: the cuff, the thermometer and the CO2 sensor. The glucose meter and ultrasound are at base, so steps that need them are blocked and the card gives an at-base fallback. The challenge lists rovers as an environment, and this is where equipment really changes the decision.

**13. How would it work for a whole crew?**
It already has six profiles, each with its own history, check-ins, decisions and medication log, plus a shared message board and notices. A flight surgeon view reviews decisions. Scaling up means connecting real devices and syncing the ledger over the spacecraft network.

**14. How did you use NASA’s resources?**
The challenge’s Resources tab drives the structure: NASA’s five hazards and human risks are our hazard tabs and mission-risk guide, and CSA’s radiation-monitoring article shapes the dose gauge. Published figures (career radiation limit, ISS CO2 bands, Mars delay, sleep on the ISS) anchor gauges, with links in the app and README.

**15. What did AI do in this project?**
An AI coding assistant wrote much of the code from our design and specification, and the body illustrations are AI-generated and labelled in the app. The team set the concept, research and scope, reviewed the work, and is presenting it. Full disclosure is in the README.

**16. What would you build next?**
Real sensor input, flight-surgeon-set action windows per mission, clinical review of the rules, and syncing the ledger with mission control. Then a pilot in an analogue mission, such as a polar station or a NASA HERA-style habitat.

**17. How do you know it works?**
140 automated tests cover the decision engine, baselines, scenarios, ledger delays, the rover kit and saved state. We checked every page at phone and tablet width and checked text contrast. It’s still a prototype, so clinical validation is the honest next step.
