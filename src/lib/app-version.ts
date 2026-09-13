import { Capacitor } from "@capacitor/core";
import isElectron from "is-electron";

/**
 * What build this is. The values are substituted at build time from
 * package.json and git (see build-info.ts); nothing here is read at runtime, so
 * it costs nothing and can't be wrong about the bundle it's inside.
 */
export const appVersion = __APP_VERSION__;
export const appCommit = __APP_COMMIT__;

/** `0.1.0 (a1b2c3d4)` — the one string worth putting in a bug report. */
export const appBuild = `${appVersion} (${appCommit})`;

const platform = (): string => {
  if (isElectron()) return "desktop";
  if (Capacitor.isNativePlatform()) return Capacitor.getPlatform();
  return "web";
};

/**
 * The build plus the environment it's running in. Half of every "it doesn't
 * work for me" is answered by this, so it's offered as one copyable block
 * rather than something a reporter has to assemble.
 */
export const buildReport = (): string =>
  [`AudioGata ${appBuild}`, platform(), navigator.userAgent].join("\n");
