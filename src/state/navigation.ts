/** Return null for a fragment that is not a page, so section links don't reset navigation. */
export function resolvePageHash<T extends string>(hash: string, pages: readonly T[]): T | null {
  const raw = hash.replace(/^#/, "").toLowerCase();
  const aliases: Record<string, string> = { "daily-checkin": "check-ins", "daily-checkins": "check-ins", "daily-check-in": "check-ins", "daily-check-ins": "check-ins", "checkin": "check-ins", "check-ins/": "check-ins", scenario: "mission-settings" };
  const name = aliases[raw] ?? raw;
  return pages.find((page) => page === name) ?? null;
}
