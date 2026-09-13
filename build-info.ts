import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * The identity a build carries, injected by both vite.config.ts and the
 * electron renderer config so the web, desktop and Android builds can't
 * disagree about what they are.
 *
 * package.json is the single source of truth for the version — `npm version`
 * bumps it, the Android build reads it (android/app/build.gradle) and this
 * hands it to the app. Nothing else should hardcode a version.
 */

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
) as { version: string };

const commit = (): string => {
  try {
    // `--always` falls back to the hash when no tag has been cut yet, and
    // `--dirty` is what tells a bug report that a dev build wasn't clean.
    return execSync("git describe --always --dirty --abbrev=8", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    // A build from a source tarball, or a container without git. The version
    // alone still names the release, just not the commit inside it.
    return "unknown";
  }
};

export const buildInfoDefine = () => ({
  __APP_VERSION__: JSON.stringify(packageJson.version),
  __APP_COMMIT__: JSON.stringify(commit()),
});
