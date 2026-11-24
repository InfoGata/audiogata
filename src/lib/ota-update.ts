import { Capacitor } from "@capacitor/core";

/**
 * Over-the-air updates for the native app: the web bundle is swapped while
 * the binary stays the same. Self-hosted. `npm run ota:publish` attaches a zip
 * of dist and an ota.json describing it to a GitHub release, and the app
 * reads the ota.json of whichever release is marked latest.
 *
 * A bundle is only installed when:
 * - it was built for the same native code as the installed binary (see
 *   native-fingerprint.ts). Otherwise it could call native methods the binary
 *   doesn't have. Those users get the update from the store instead.
 * - its version is newer than the running one. A store build ahead of the
 *   latest OTA is never downgraded.
 * - it hasn't already failed to boot on this device.
 * - it is signed. capacitor.config.ts gives Capgo a public key, and Capgo
 *   rejects any bundle whose session key and checksum weren't made with the
 *   matching private key (scripts/ota-crypto.ts).
 *
 * The signature covers the zip but not the version label in ota.json. A
 * running OTA bundle therefore checks that its label matches the version
 * built into its code. Otherwise an old signed bundle relabelled 9.9.9 would
 * hold every device on old code, since nothing below 9.9.9 would count as
 * newer.
 *
 * A downloaded bundle takes effect the next time the app goes to the
 * background or is relaunched, not while someone is reading. If it then fails
 * to call notifyAppReady within Capgo's timeout (10s), Capgo rolls back to
 * the previous bundle and marks this one as errored.
 */

export const OTA_MANIFEST_URL =
  "https://github.com/InfoGata/audiogata/releases/latest/download/ota.json";

export interface OtaManifest {
  version: string;
  commit: string;
  nativeFingerprint: string;
  url: string;
  /** sha256 of the unencrypted zip, encrypted with the private key, hex. */
  checksum: string;
  /** `base64(iv):base64(encrypted AES key)`, from scripts/ota-crypto.ts. */
  sessionKey: string;
}

const BUILTIN_BUNDLE_ID = "builtin";

/**
 * `0.1.0+native.ab12cd34ef56`: the form of the binary's version (see
 * capacitor.config.ts) and of every bundle this file downloads.
 */
export const bundleLabel = (version: string, fingerprint: string): string =>
  `${version}+native.${fingerprint}`;

/** `0.1.0+native.ab12cd34ef56` → `ab12cd34ef56`. */
export const fingerprintOf = (label: string): string | undefined =>
  /\+native\.([0-9a-f]+)$/.exec(label)?.[1];

/**
 * Compares `major.minor.patch`. A pre-release suffix sorts below its release,
 * and two different suffixes on the same release don't count as newer. That
 * is enough to never downgrade, which is all this needs to get right.
 */
export const isNewerVersion = (candidate: string, current: string): boolean => {
  const parse = (v: string) => {
    const [core, pre] = v.split("-", 2);
    return { nums: core.split(".").map((n) => parseInt(n, 10) || 0), pre };
  };
  const a = parse(candidate);
  const b = parse(current);
  for (let i = 0; i < 3; i++) {
    const diff = (a.nums[i] ?? 0) - (b.nums[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return b.pre !== undefined && a.pre === undefined;
};

const isOtaManifest = (value: unknown): value is OtaManifest => {
  const v = value as Partial<OtaManifest> | null;
  return (
    typeof v?.version === "string" &&
    typeof v.nativeFingerprint === "string" &&
    typeof v.url === "string" &&
    typeof v.checksum === "string" &&
    typeof v.sessionKey === "string"
  );
};

let started = false;

/**
 * Call once the app has rendered. Calling it is what tells Capgo this bundle
 * works, so it has to come after the point where a broken bundle would have
 * failed. Native only; a no-op everywhere else.
 */
export const startOtaUpdates = async (): Promise<void> => {
  if (started || !Capacitor.isNativePlatform()) return;
  started = true;

  const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
  const { bundle: current } = await CapacitorUpdater.notifyAppReady();

  try {
    const { version: builtinVersion } =
      await CapacitorUpdater.getBuiltinVersion();
    const nativeFp = fingerprintOf(builtinVersion);
    // A binary built before OTA was set up, or with the config missing.
    if (!nativeFp) return;

    // Downloaded bundles are labelled with both halves of their identity,
    // e.g. `0.1.1+native.ab12cd34ef56`. A bundle built for another binary then
    // never matches a manifest by accident, and the check below also covers
    // it.
    //
    // A running OTA bundle whose label isn't its own is either built for a
    // different binary (Capgo usually drops those on a store update, but not
    // always, e.g. a sideloaded build) or a signed bundle relabelled in
    // ota.json (see above). It is marked failed so it's never chosen again,
    // and the app goes back to the built-in bundle. Never done on the
    // built-in bundle itself, where a reset would reload the same state
    // forever. reset() reloads the page, so nothing after it runs.
    if (
      current.id !== BUILTIN_BUNDLE_ID &&
      current.version !== bundleLabel(__APP_VERSION__, __NATIVE_FINGERPRINT__)
    ) {
      await CapacitorUpdater.setBundleError({ id: current.id });
      await CapacitorUpdater.reset();
      return;
    }

    const { bundles } = await CapacitorUpdater.list();
    // Bundles for another binary can never run here again. Failed bundles for
    // this binary are kept: their error status is what stops a re-download.
    for (const b of bundles) {
      if (b.id !== current.id && fingerprintOf(b.version) !== nativeFp) {
        await CapacitorUpdater.delete({ id: b.id }).catch(() => {});
      }
    }

    const response = await fetch(OTA_MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) return;
    const manifest: unknown = await response.json();
    if (!isOtaManifest(manifest)) return;
    if (manifest.nativeFingerprint !== nativeFp) return;
    if (!isNewerVersion(manifest.version, __APP_VERSION__)) return;

    const label = bundleLabel(manifest.version, nativeFp);
    const existing = bundles.find((b) => b.version === label);
    // Failed bundles are kept (autoDeleteFailed: false) so they are skipped
    // here rather than downloaded again on every launch.
    if (existing?.status === "error") return;

    const ready =
      existing?.status === "success" || existing?.status === "pending";
    const bundle = ready
      ? existing
      : await CapacitorUpdater.download({
          url: manifest.url,
          version: label,
          checksum: manifest.checksum,
          sessionKey: manifest.sessionKey,
        });
    await CapacitorUpdater.next({ id: bundle.id });
  } catch (error) {
    // Offline, GitHub unreachable, a bad zip. The app works the same without
    // an update, and the next launch tries again.
    console.warn("[ota] update check failed", error);
  }
};
