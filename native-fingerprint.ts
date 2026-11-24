import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * A hash of everything an over-the-air update can't change: the Java/Swift in
 * the native projects, their build files, the Capacitor config that gets
 * copied into them, the installed version of every package that ships native
 * code, and the po-minter script the native plugin reads from the binary.
 *
 * An OTA bundle only replaces the web code, so it is safe to run only on a
 * binary built from the same native code. If a bundle calls a method that
 * PoTokenMinterPlugin gained after the user installed the app, that call
 * fails. Both sides carry this hash: the binary through the CapacitorUpdater
 * `version` in capacitor.config.ts, and the bundle through
 * `__NATIVE_FINGERPRINT__`. src/lib/ota-update.ts only installs a bundle whose
 * hash matches the binary's.
 *
 * Changing anything hashed here means the next release needs a store build;
 * old binaries stop receiving OTA updates until they install it. A change that
 * has no effect on the JS (a comment in MainActivity) still counts. That is
 * the safe direction to be wrong in.
 *
 * Paths resolve from the working directory, not this file. The Capacitor CLI
 * transpiles capacitor.config.ts to CommonJS, where `import.meta` doesn't
 * exist. vite, the cap CLI and the publish script all run from the project
 * root.
 */

const root = process.cwd();

/** Directories whose files are hashed, recursively. */
const NATIVE_DIRS = [
  "android/app/src/main/java",
  "ios/App/App",
  "ios/App/CapApp-SPM/Sources",
  // The source of public/po-minter.js (vite.po-minter.config.ts). It ends up
  // in dist like any other file, but PoTokenMinterPlugin (Java and Swift)
  // reads it from the binary's own copy of the web assets
  // (`public/po-minter.js` in the APK assets and the iOS app bundle), never
  // from the bundle Capgo is running. An OTA can't change what the minter
  // page runs, so it belongs to the native side. The whole directory, so a
  // new local import of page.ts is covered; native.ts and providers.ts are
  // also the JS half of the plugin's interface.
  "src/po-minter",
];

/**
 * Generated copies of the web build and config. `cap sync` rewrites these, and
 * they would make the hash depend on whatever dist happened to be copied last.
 */
const EXCLUDED = [
  "ios/App/App/public",
  "ios/App/App/capacitor.config.json",
  "ios/App/App/config.xml",
  "ios/App/App/Assets.xcassets",
];

/**
 * Not android/capacitor.settings.gradle, android/app/capacitor.build.gradle,
 * ios/App/CapApp-SPM/Package.swift or the capacitor-cordova-*-plugins
 * projects. `cap sync` regenerates them from the installed plugins, which
 * nativePackages() already covers, and it writes them after it has read this
 * config. Hashing them would give a binary a fingerprint from before the
 * sync, which no later bundle could match.
 */
const NATIVE_FILES = [
  "capacitor.config.ts",
  // Built into the binary by capacitor.config.ts. Bundles signed with a new
  // key would be rejected by binaries that still have the old one.
  "ota-public-key.pem",
  "android/app/src/main/AndroidManifest.xml",
  "android/app/build.gradle",
  "android/build.gradle",
  "android/variables.gradle",
  // How po-minter.js is built; see NATIVE_DIRS.
  "vite.po-minter.config.ts",
];

/**
 * Packages without native code of their own whose code is compiled into a
 * file the binary reads from its own assets: po-minter.js bundles bgutils-js.
 */
const BUNDLED_INTO_NATIVE = ["bgutils-js"];

const walk = (dir: string): string[] => {
  const abs = join(root, dir);
  if (!existsSync(abs) || EXCLUDED.includes(dir)) return [];
  if (statSync(abs).isFile()) return [dir];
  return readdirSync(abs)
    .sort()
    .flatMap((name) => walk(join(dir, name)));
};

/**
 * Where npm installed a package from, when that isn't the registry. A git
 * dependency (cordova-plugin-inappbrowser) keeps the same version in its
 * package.json across commits, so the commit in the URL is what identifies
 * its native code.
 */
const gitSourceOf = (name: string): string | undefined => {
  const lockPath = join(root, "node_modules", ".package-lock.json");
  if (!existsSync(lockPath)) return undefined;
  const lock = JSON.parse(readFileSync(lockPath, "utf8")) as {
    packages?: Record<string, { resolved?: string }>;
  };
  const resolved = lock.packages?.[`node_modules/${name}`]?.resolved;
  return resolved?.startsWith("git") ? resolved : undefined;
};

/**
 * `name@version` for every dependency with native code. The installed version
 * is used rather than the range in package.json: `^8.0.1` covers builds with
 * different native code.
 */
const nativePackages = (): string[] => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
  };
  return Object.keys(pkg.dependencies ?? {})
    .sort()
    .flatMap((name) => {
      const dir = join(root, "node_modules", name);
      const isNative =
        name.startsWith("@capacitor/") ||
        BUNDLED_INTO_NATIVE.includes(name) ||
        existsSync(join(dir, "android")) ||
        existsSync(join(dir, "ios")) ||
        // Cordova plugins keep their native code in src/ and declare it here.
        existsSync(join(dir, "plugin.xml"));
      if (!isNative) return [];
      const { version } = JSON.parse(
        readFileSync(join(dir, "package.json"), "utf8")
      ) as { version: string };
      const source = gitSourceOf(name);
      return [source ? `${name}@${version} ${source}` : `${name}@${version}`];
    });
};

let cached: string | undefined;

export const nativeFingerprint = (): string => {
  if (cached) return cached;
  const hash = createHash("sha256");
  const files = [...NATIVE_FILES, ...NATIVE_DIRS.flatMap(walk)];
  for (const file of files) {
    const abs = join(root, file);
    if (!existsSync(abs)) continue;
    // Normalized so a checkout with CRLF line endings hashes the same.
    const content = readFileSync(abs, "utf8").replace(/\r\n/g, "\n");
    hash.update(`${relative(root, abs)}\0${content}\0`);
  }
  for (const entry of nativePackages()) hash.update(`${entry}\0`);
  cached = hash.digest("hex").slice(0, 12);
  return cached;
};
