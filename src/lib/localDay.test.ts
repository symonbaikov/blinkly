import { describe, expect, it } from "vitest";
import { msUntilNextLocalDay } from "./localDay";

describe("msUntilNextLocalDay", () => {
  it("returns the milliseconds until the next local midnight", () => {
    expect(msUntilNextLocalDay(new Date(2026, 0, 15, 23, 59, 30, 0))).toBe(30_000);
    expect(msUntilNextLocalDay(new Date(2026, 0, 15, 12, 0, 0, 0))).toBe(43_200_000);
  });

  it("returns a full day at local midnight", () => {
    expect(msUntilNextLocalDay(new Date(2026, 0, 15, 0, 0, 0, 0))).toBe(86_400_000);
  });
});
