import { describe, expect, test } from "vitest";
import { formatSeconds } from "../../utils";

describe("formatSeconds", () => {
  test("returns 00:00 when no seconds provided", () => {
    expect(formatSeconds()).toBe("00:00");
    expect(formatSeconds(undefined)).toBe("00:00");
  });

  test("formats seconds less than a minute correctly", () => {
    expect(formatSeconds(0)).toBe("00:00");
    expect(formatSeconds(1)).toBe("00:01");
    expect(formatSeconds(30)).toBe("00:30");
    expect(formatSeconds(59)).toBe("00:59");
  });

  test("formats minutes correctly", () => {
    expect(formatSeconds(60)).toBe("01:00");
    expect(formatSeconds(65)).toBe("01:05");
    expect(formatSeconds(599)).toBe("09:59");
    expect(formatSeconds(600)).toBe("10:00");
    expect(formatSeconds(3599)).toBe("59:59");
  });

  test("formats hours correctly", () => {
    expect(formatSeconds(3600)).toBe("1:00:00");
    expect(formatSeconds(3661)).toBe("1:01:01");
    expect(formatSeconds(7200)).toBe("2:00:00");
    expect(formatSeconds(86399)).toBe("23:59:59");
  });

  test("handles floating point seconds", () => {
    expect(formatSeconds(60.5)).toBe("01:00");
    expect(formatSeconds(65.9)).toBe("01:05");
  });
});