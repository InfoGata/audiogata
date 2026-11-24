/**
 * Publishes the current build as an over-the-air update for the native app.
 *
 *   npm run ota:publish            build, zip, attach to release v<version>
 *   npm run ota:publish -- --dry-run   build and zip only, upload nothing
 *
 * Every app built with the same native code (native-fingerprint.ts) picks it
 * up on its next launch, so this is a release, not a preview. The version is
 * package.json's, so bump it first (`npm version patch`). The app only
 * installs bundles newer than the one it is running, and each version can be
 * published only once: a device already on 0.1.3 never downloads a second
 * 0.1.3.
 *
 * The bundle is signed with the private key from `npm run ota:keygen`
 * (scripts/ota-crypto.ts), and the app refuses anything else. The key is
 * checked against the committed ota-public-key.pem before anything is built,
 * so a mismatched key fails here, not on every device.
 *
 * The files go on the GitHub release for the version's tag. The app reads
 * releases/latest/download/ota.json, so the release has to be the one GitHub
 * marks latest. A draft or pre-release is invisible to it.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { nativeFingerprint } from "../native-fingerprint.ts";
import { publicKeyPemOf, signBundle, verifyBundle } from "./ota-crypto.ts";
import { otaPrivateKeyPath, OTA_PUBLIC_KEY_FILE } from "./ota-paths.ts";

const REPO = "InfoGata/audiogata";
const OUT_DIR = resolve("ota-out");
const dryRun = process.argv.includes("--dry-run");

const run = (cmd: string, args: string[], cwd?: string): string =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();

const fail = (message: string): never => {
  console.error(`ota:publish: ${message}`);
  process.exit(1);
};

const privateKeyPath = otaPrivateKeyPath();
if (!existsSync(privateKeyPath)) {
  fail(
    `no signing key at ${privateKeyPath}. Set OTA_PRIVATE_KEY_PATH, or run ` +
      "`npm run ota:keygen` if this app has never had one."
  );
}
const privateKey = readFileSync(privateKeyPath, "utf8");
const publicKey = readFileSync(OTA_PUBLIC_KEY_FILE, "utf8");
if (publicKeyPemOf(privateKey).trim() !== publicKey.trim()) {
  fail(`${privateKeyPath} doesn't match ${OTA_PUBLIC_KEY_FILE}. Apps would reject this update.`);
}

const { version } = JSON.parse(readFileSync("package.json", "utf8")) as {
  version: string;
};
const tag = `v${version}`;

// A published bundle has to be reproducible from a commit, and the commit is
// what the About page reports. A dirty tree would report a build no one can
// check out.
if (!dryRun) {
  if (run("git", ["status", "--porcelain"]) !== "") {
    fail("the working tree has uncommitted changes. Commit or stash them first.");
  }
  const head = run("git", ["rev-parse", "HEAD"]);
  run("git", ["fetch", "--quiet", "origin"]);
  if (run("git", ["branch", "-r", "--contains", head]) === "") {
    fail(`${head.slice(0, 8)} isn't on origin yet. Push it first.`);
  }
}

// `gh release view` exits non-zero when the release doesn't exist.
const existingAssets = (): string[] | undefined => {
  try {
    const out = run("gh", ["release", "view", tag, "--repo", REPO, "--json", "assets,isDraft,isPrerelease"]);
    const release = JSON.parse(out) as {
      assets: { name: string }[];
      isDraft: boolean;
      isPrerelease: boolean;
    };
    if (release.isDraft || release.isPrerelease) {
      console.warn(
        `ota:publish: ${tag} is a ${release.isDraft ? "draft" : "pre-release"}. ` +
          "Devices only see the release marked latest, so publish it on GitHub afterwards."
      );
    }
    return release.assets.map((a) => a.name);
  } catch {
    return undefined;
  }
};

const assets = dryRun ? undefined : existingAssets();
if (assets?.includes("ota.json")) {
  fail(`${tag} already has an OTA update. Bump the version (npm version patch) and publish that.`);
}

console.log(`ota:publish: building ${tag}`);
execFileSync("npm", ["run", "build"], { stdio: "inherit" });

const fingerprint = nativeFingerprint();
const commit = run("git", ["describe", "--always", "--dirty", "--abbrev=8"]);
const zipName = `audiogata-web-${version}.zip`;
const plainZipPath = join(OUT_DIR, "plain.zip");
const zipPath = join(OUT_DIR, zipName);

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
// From inside dist so index.html is at the root of the zip, which is where
// Capgo looks for it. -X leaves out extra file attributes so the zip only
// depends on the files themselves.
run("zip", ["-q", "-r", "-X", plainZipPath, "."], resolve("dist"));

const plainZip = readFileSync(plainZipPath);
const signed = signBundle(plainZip, privateKey);
// What a device will do with it, using only the public key it has.
if (!verifyBundle(signed, publicKey).equals(plainZip)) {
  fail("the signed bundle didn't decrypt back to the original zip.");
}
writeFileSync(zipPath, signed.encrypted);
rmSync(plainZipPath);
const manifest = {
  version,
  commit,
  nativeFingerprint: fingerprint,
  url: `https://github.com/${REPO}/releases/download/${tag}/${zipName}`,
  checksum: signed.checksum,
  sessionKey: signed.sessionKey,
};
const manifestPath = join(OUT_DIR, "ota.json");
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify(manifest, null, 2));
if (dryRun) {
  console.log(`ota:publish: dry run, nothing uploaded. Files are in ${OUT_DIR}`);
  process.exit(0);
}

if (assets) {
  // The zip goes first: a device that sees ota.json must be able to download
  // what it points to.
  run("gh", ["release", "upload", tag, zipPath, "--repo", REPO]);
  run("gh", ["release", "upload", tag, manifestPath, "--repo", REPO]);
} else {
  run("gh", [
    "release", "create", tag, zipPath, manifestPath,
    "--repo", REPO,
    "--target", run("git", ["rev-parse", "HEAD"]),
    "--title", `AudioGata ${version}`,
    "--generate-notes",
    "--latest",
  ]);
}
console.log(`ota:publish: published ${tag} for native build ${fingerprint}`);
