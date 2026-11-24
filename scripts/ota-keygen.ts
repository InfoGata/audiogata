/**
 * Creates the key pair that signs over-the-air bundles.
 *
 *   npm run ota:keygen
 *
 * The private key goes to OTA_PRIVATE_KEY_PATH (default below), outside the
 * repo and readable only by you. The public key goes to ota-public-key.pem in
 * the repo, and capacitor.config.ts builds it into the native app.
 *
 * Run this once. A new key pair means a store build: binaries with the old
 * public key reject everything signed with the new private key. Losing the
 * private key has the same effect, so back it up the way you back up the
 * release keystore. Refuses to overwrite an existing key.
 */
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { generateOtaKeyPair } from "./ota-crypto.ts";
import { otaPrivateKeyPath, OTA_PUBLIC_KEY_FILE } from "./ota-paths.ts";

const privatePath = otaPrivateKeyPath();

if (existsSync(privatePath)) {
  console.error(`ota:keygen: ${privatePath} already exists. Not overwriting it.`);
  process.exit(1);
}

const { publicKey, privateKey } = generateOtaKeyPair();
mkdirSync(dirname(privatePath), { recursive: true, mode: 0o700 });
writeFileSync(privatePath, privateKey, { mode: 0o600 });
chmodSync(privatePath, 0o600);
writeFileSync(OTA_PUBLIC_KEY_FILE, publicKey);

console.log(`ota:keygen: private key written to ${privatePath} (back it up)`);
console.log(`ota:keygen: public key written to ${OTA_PUBLIC_KEY_FILE} (commit it)`);
