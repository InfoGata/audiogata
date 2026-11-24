import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import {
  generateOtaKeyPair,
  publicKeyPemOf,
  signBundle,
  verifyBundle,
} from "./ota-crypto";

const { publicKey, privateKey } = generateOtaKeyPair();
const zip = randomBytes(5000);

describe("ota bundle signing", () => {
  it("round-trips through the public key", () => {
    const signed = signBundle(zip, privateKey);
    expect(verifyBundle(signed, publicKey).equals(zip)).toBe(true);
    expect(signed.encrypted.equals(zip)).toBe(false);
  });

  it("produces what the plugin checks for", () => {
    const signed = signBundle(zip, privateKey);
    // Capgo rejects an encrypted checksum that isn't exactly 256 bytes.
    expect(Buffer.from(signed.checksum, "hex")).toHaveLength(256);
    expect(signed.checksum).toMatch(/^[0-9a-f]+$/);
    const [iv, key] = signed.sessionKey.split(":");
    expect(Buffer.from(iv, "base64")).toHaveLength(16);
    expect(Buffer.from(key, "base64")).toHaveLength(256);
    expect(publicKey.startsWith("-----BEGIN RSA PUBLIC KEY-----")).toBe(true);
  });

  it("rejects a bundle signed with another key", () => {
    const other = generateOtaKeyPair();
    const signed = signBundle(zip, other.privateKey);
    expect(() => verifyBundle(signed, publicKey)).toThrow();
  });

  it("rejects a checksum lifted from a different bundle", () => {
    const signed = signBundle(zip, privateKey);
    const other = signBundle(randomBytes(5000), privateKey);
    expect(() =>
      verifyBundle({ ...signed, checksum: other.checksum }, publicKey)
    ).toThrow();
  });

  it("derives the committed public key from the private one", () => {
    expect(publicKeyPemOf(privateKey).trim()).toBe(publicKey.trim());
  });
});
