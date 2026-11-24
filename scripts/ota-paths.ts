import { homedir } from "node:os";
import { join } from "node:path";

/** Committed. Read by capacitor.config.ts and hashed by native-fingerprint.ts. */
export const OTA_PUBLIC_KEY_FILE = "ota-public-key.pem";

/**
 * Never committed. Next to the Android release keystore by default, since
 * whoever can sign store builds is who should sign OTA updates.
 */
export const otaPrivateKeyPath = (): string =>
  process.env.OTA_PRIVATE_KEY_PATH ??
  join(homedir(), ".android", "audiogata-release", "ota-private.pem");
