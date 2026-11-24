import { CapacitorConfig } from "@capacitor/cli";
import { readFileSync } from "node:fs";
import { nativeFingerprint } from "./native-fingerprint";

// Relative to the working directory: the Capacitor CLI transpiles this file
// to CommonJS, where `import.meta` doesn't exist. See native-fingerprint.ts.
const { version } = JSON.parse(readFileSync("package.json", "utf8")) as {
  version: string;
};

// Over-the-air bundles must be signed with the matching private key (see
// scripts/ota-crypto.ts). Reading it here, without a fallback, means no binary
// can be built that accepts unsigned updates.
const otaPublicKey = readFileSync("ota-public-key.pem", "utf8").trim();

const config: CapacitorConfig = {
  appId: "com.audiogata.app",
  appName: "AudioGata",
  webDir: "dist",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    // Over-the-air updates of the web bundle. See src/lib/ota-update.ts.
    CapacitorUpdater: {
      // The app decides when to check and what to install. Capgo's automatic
      // mode polls Capgo's own servers.
      autoUpdate: false,
      // Defaults to plugin.capgo.app. An empty string turns stats off, so
      // nothing goes to Capgo.
      statsUrl: "",
      // The native identity of this binary, readable from JS through
      // getBuiltinVersion(). The fingerprint is semver build metadata, which
      // Capgo ignores when comparing versions. A different fingerprint after
      // a store update also makes Capgo drop downloaded bundles and go back
      // to the built-in one.
      version: `${version}+native.${nativeFingerprint()}`,
      // Keep a bundle that failed to boot, so its error status stops the app
      // from downloading it again on every launch.
      autoDeleteFailed: false,
      // With a key set, Capgo refuses any bundle without a session key and
      // checksum produced by the private key. The key lives outside the repo
      // (scripts/ota-paths.ts), so write access to GitHub releases isn't
      // enough to ship code to the app.
      publicKey: otaPublicKey,
      // Lets ota-update.ts mark a bundle as failed when its version label
      // doesn't match the code inside it.
      allowManualBundleError: true,
    },
  },
};

export default config;
