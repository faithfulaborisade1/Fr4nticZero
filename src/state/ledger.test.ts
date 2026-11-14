import { describe, expect, it } from "vitest";
import { generateHistory } from "../data/generator";
import { getScenario } from "../data/scenarios";
import { makeEnvironment } from "../engine/environments";
import { buildCards } from "./cards";
import {
  addEntry,
  canReview,
  createEntry,
  linkState,
  releaseHeld,
  reviewEntry,
  reviewState,
  secondsToArrival,
} from "./ledger";

const T0 = "2026-12-13T08:00:00.000Z";
const at = (sec: number) => new Date(new Date(T0).getTime() + sec * 1000).toISOString();

const history = getScenario("bp_spike").apply(generateHistory(2026, 30));
function entryFor(env: ReturnType<typeof makeEnvironment>) {
  const [e] = buildCards(history, env, T0);
  return createEntry(e.card, e.rule, "I will follow the holding steps", env, T0);
}

const mars = makeEnvironment("mars", 22 * 60);

describe("ledger delivery", () => {
  it("queues for one one-way delay, then delivers", () => {
    const e = entryFor(mars);
    expect(e.deliverAtISO).toBe(at(22 * 60));
    expect(linkState(e, T0)).toBe("queued");
    expect(linkState(e, at(22 * 60 - 1))).toBe("queued");
    expect(linkState(e, at(22 * 60))).toBe("delivered");
    expect(secondsToArrival(e, at(60))).toBe(22 * 60 - 60);
  });

  it("delivers almost at once on Station", () => {
    const e = entryFor(makeEnvironment("station"));
    expect(linkState(e, at(0))).toBe("queued");
    expect(linkState(e, at(1))).toBe("delivered");
  });

  it("does not store the same card twice", () => {
    const e = entryFor(mars);
    expect(addEntry(addEntry([], e), e)).toHaveLength(1);
  });
});

describe("surgeon review", () => {
  it("cannot review before delivery", () => {
    const [e] = [entryFor(mars)];
    expect(canReview(e, at(10))).toBe(false);
    expect(reviewEntry([e], e.id, "concur", mars, at(10))[0].surgeonReview).toBeUndefined();
  });

  it("travels back with another delay", () => {
    const e = entryFor(mars);
    const [r] = reviewEntry([e], e.id, "concur", mars, at(22 * 60));
    expect(r.surgeonReview).toBe("concur");
    expect(r.reviewArrivesISO).toBe(at(44 * 60));
    expect(reviewState(r, at(30 * 60))).toBe("in_transit");
    expect(reviewState(r, at(44 * 60))).toBe("received");
    expect(secondsToArrival(r, at(30 * 60))).toBe(14 * 60);
    expect(secondsToArrival(r, at(44 * 60))).toBeNull();
  });

  it("only one review per entry", () => {
    const e = entryFor(mars);
    const [r1] = reviewEntry([e], e.id, "concur", mars, at(22 * 60));
    const [r2] = reviewEntry([r1], e.id, "overrule", mars, at(23 * 60));
    expect(r2.surgeonReview).toBe("concur");
  });
});

describe("blackout", () => {
  const dark = { ...mars, blackout: true };

  it("holds an entry logged during blackout until the link returns", () => {
    const e = entryFor(dark);
    expect(e.deliverAtISO).toBeNull();
    expect(linkState(e, at(99999))).toBe("held");
    const [r] = releaseHeld([e], mars, at(3600));
    expect(r.deliverAtISO).toBe(at(3600 + 22 * 60));
    expect(linkState(r, at(3600 + 22 * 60))).toBe("delivered");
  });

  it("does not release while the link is still dark", () => {
    const e = entryFor(dark);
    expect(releaseHeld([e], dark, at(3600))[0].deliverAtISO).toBeNull();
  });

  it("holds a surgeon review that was sent during blackout", () => {
    const e = entryFor(mars);
    const [rev] = reviewEntry([e], e.id, "overrule", dark, at(22 * 60));
    expect(reviewState(rev, at(99999))).toBe("held");
    const [back] = releaseHeld([rev], mars, at(7200));
    expect(back.reviewArrivesISO).toBe(at(7200 + 22 * 60));
  });
});
