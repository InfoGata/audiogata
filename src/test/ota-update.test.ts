import { describe, expect, it } from "vitest";
import { bundleLabel, fingerprintOf, isNewerVersion } from "@/lib/ota-update";

describe("isNewerVersion", () => {
  it("orders by major, minor, then patch", () => {
    expect(isNewerVersion("0.1.1", "0.1.0")).toBe(true);
    expect(isNewerVersion("0.2.0", "0.1.9")).toBe(true);
    expect(isNewerVersion("1.0.0", "0.99.99")).toBe(true);
    expect(isNewerVersion("0.10.0", "0.9.0")).toBe(true);
  });

  it("never treats an equal or older version as newer", () => {
    expect(isNewerVersion("0.1.0", "0.1.0")).toBe(false);
    expect(isNewerVersion("0.1.0", "0.1.1")).toBe(false);
    expect(isNewerVersion("0.9.0", "0.10.0")).toBe(false);
  });

  it("puts a release above its own pre-releases", () => {
    expect(isNewerVersion("0.2.0", "0.2.0-beta.1")).toBe(true);
    expect(isNewerVersion("0.2.0-beta.1", "0.2.0")).toBe(false);
    expect(isNewerVersion("0.2.0-beta.2", "0.2.0-beta.1")).toBe(false);
  });
});

describe("fingerprintOf", () => {
  it("reads the fingerprint capacitor.config.ts puts in the version", () => {
    expect(fingerprintOf("0.1.0+native.ab12cd34ef56")).toBe("ab12cd34ef56");
  });

  it("reads back the label given to a downloaded bundle", () => {
    expect(bundleLabel("0.1.1", "ab12cd34ef56")).toBe("0.1.1+native.ab12cd34ef56");
    expect(fingerprintOf(bundleLabel("0.1.1", "ab12cd34ef56"))).toBe("ab12cd34ef56");
  });

  it("returns nothing for a binary built without one", () => {
    expect(fingerprintOf("0.1.0")).toBeUndefined();
    expect(fingerprintOf("1.0")).toBeUndefined();
  });
});
