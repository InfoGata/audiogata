/**
 * Signing for over-the-air bundles, in the format @capgo/capacitor-updater
 * checks when `publicKey` is set in capacitor.config.ts ("encryption v2").
 *
 * - The zip is encrypted with AES-128-CBC under a random key and IV.
 * - sessionKey = base64(iv) ":" base64(RSA-private-encrypt(aes key))
 * - checksum   = hex(RSA-private-encrypt(sha256 of the unencrypted zip))
 *
 * The RSA operations use PKCS#1 v1.5 padding with a 2048-bit key. The
 * plugin rejects any other size, because it expects an encrypted checksum
 * of exactly 256 bytes. Only the private key can produce values that decrypt
 * under the public key built into the app. So the app installs only bundles
 * published with that key, wherever the zip is hosted.
 *
 * None of this keeps the bundle secret: the public key ships in the app and
 * decrypts the session key. What the scheme provides is authenticity.
 */
import {
  constants,
  createCipheriv,
  createDecipheriv,
  createHash,
  createPublicKey,
  generateKeyPairSync,
  privateEncrypt,
  publicDecrypt,
  randomBytes,
  type KeyObject,
} from "node:crypto";

export interface SignedBundle {
  encrypted: Buffer;
  sessionKey: string;
  checksum: string;
}

const PADDING = constants.RSA_PKCS1_PADDING;

export const generateOtaKeyPair = () =>
  generateKeyPairSync("rsa", {
    modulusLength: 2048,
    // PKCS#1 ("BEGIN RSA PUBLIC KEY") is the only public key format the
    // plugin parses.
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

/** The public key in the PEM form capacitor.config.ts embeds. */
export const publicKeyPemOf = (privateKeyPem: string): string =>
  createPublicKey(privateKeyPem)
    .export({ type: "pkcs1", format: "pem" })
    .toString();

export const signBundle = (zip: Buffer, privateKeyPem: string): SignedBundle => {
  const aesKey = randomBytes(16);
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-128-cbc", aesKey, iv);
  const encrypted = Buffer.concat([cipher.update(zip), cipher.final()]);

  const key = { key: privateKeyPem, padding: PADDING };
  const sessionKey = `${iv.toString("base64")}:${privateEncrypt(key, aesKey).toString("base64")}`;
  const digest = createHash("sha256").update(zip).digest();
  const checksum = privateEncrypt(key, digest).toString("hex");
  return { encrypted, sessionKey, checksum };
};

/**
 * The plugin's half, so the publish script can check what it is about to
 * upload: it decrypts the bundle and returns the zip, or throws.
 */
export const verifyBundle = (
  bundle: SignedBundle,
  publicKey: string | KeyObject
): Buffer => {
  const key = { key: publicKey, padding: PADDING };
  const [ivB64, keyB64] = bundle.sessionKey.split(":");
  const aesKey = publicDecrypt(key, Buffer.from(keyB64, "base64"));
  const decipher = createDecipheriv("aes-128-cbc", aesKey, Buffer.from(ivB64, "base64"));
  const zip = Buffer.concat([decipher.update(bundle.encrypted), decipher.final()]);

  const expected = publicDecrypt(key, Buffer.from(bundle.checksum, "hex")).toString("hex");
  const actual = createHash("sha256").update(zip).digest("hex");
  if (expected !== actual) throw new Error("checksum does not match the bundle");
  return zip;
};
