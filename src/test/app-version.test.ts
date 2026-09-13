import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { appBuild, appCommit, appVersion, buildReport } from "@/lib/app-version";

// Read rather than imported, so the assertion is against the file the Android
// build and build-info.ts both read, not against a copy TypeScript inlined.
const packageVersion = (
  JSON.parse(readFileSync("package.json", "utf8")) as { version: string }
).version;

describe("app version", () => {
  it("reports the version from package.json", () => {
    // The define in vite.config.ts is the only thing keeping these in step, and
    // a build that misreports its version makes every bug report suspect.
    expect(appVersion).toBe(packageVersion);
    expect(appVersion).not.toBe("0.0.0");
  });

  it("names a commit, or says plainly that it couldn't find one", () => {
    // `git describe --always` in a repo, "unknown" from a source tarball.
    expect(appCommit).toMatch(/^([0-9a-f]{8,}(-dirty)?|.+-g[0-9a-f]+(-dirty)?|unknown)$/);
  });

  it("puts the whole build identity in one copyable block", () => {
    expect(appBuild).toBe(`${appVersion} (${appCommit})`);

    const report = buildReport();
    expect(report).toContain(`AudioGata ${appBuild}`);
    // The platform line is what separates "works on the web build" from a
    // desktop or Android report.
    expect(report.split("\n")).toHaveLength(3);
  });
});
