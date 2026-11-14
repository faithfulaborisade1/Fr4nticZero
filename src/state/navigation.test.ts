import { describe, expect, it } from "vitest";
import { resolvePageHash } from "./navigation";

describe("page fragment navigation", () => {
  const pages = ["overview", "check-ins", "body-scan", "mission-settings"] as const;
  it("opens daily check-ins from the main route and older spellings", () => {
    expect(resolvePageHash("#check-ins", pages)).toBe("check-ins");
    expect(resolvePageHash("#daily-check-in", pages)).toBe("check-ins");
    expect(resolvePageHash("#daily-checkins", pages)).toBe("check-ins");
  });
  it("does not interpret unknown section fragments as a jump to overview", () => {
    expect(resolvePageHash("#heart-check", pages)).toBeNull();
    expect(resolvePageHash("#overview", pages)).toBe("overview");
  });
  it("opens legacy scenario links within mission settings", () => {
    expect(resolvePageHash("#scenario", pages)).toBe("mission-settings");
  });
});
