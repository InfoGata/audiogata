# AudioGata

A plugin based web app that plays audio.

https://www.audiogata.com

## Running locally

```console
npm install
npm run dev
```

## Over-the-air updates

The Android and iOS apps can update their web code without a store release:

```sh
npm version patch      # each update needs a new version
git push --follow-tags
npm run ota:publish    # builds, then attaches the bundle to GitHub release v<version>
```

The app checks the latest release's `ota.json` on launch, downloads the
bundle, and switches to it the next time it goes to the background. A bundle
that fails to start is rolled back automatically. `-- --dry-run` builds and
zips into `ota-out/` without uploading.

Bundles are signed, and the app installs nothing else. `npm run ota:keygen`
created the key pair once: the public key is `ota-public-key.pem` in the repo,
and the private key is at `~/.android/audiogata-release/ota-private.pem`
(override with `OTA_PRIVATE_KEY_PATH`). Back up the private key with the
release keystore. Without it, no more OTA updates can be published until a
store build ships with a new public key.

A bundle is only offered to binaries built from the same native code
(`native-fingerprint.ts`). After a change to anything under `android/` or
`ios/`, `capacitor.config.ts`, a Capacitor or Cordova plugin version, or the
YouTube token minter (`src/po-minter/`, which the native app reads from its
own copy), ship a store build as well. Until users install it they stay on
their current version, and nothing breaks.

## Plugins

The plugin scripts are run in sandboxed iframes using [plugin-frame](https://github.com/elijahgreen/plugin-frame). Every iframe is ran on it's own subdomain with it's subdomain being the id of the plugin ([pluginId].audiogata.com).

[youtube-audiogata](https://github.com/InfoGata/youtube-audiogata)

[soundcloud-audiogata](https://github.com/InfoGata/soundcloud-audiogata)

[spotify-audiogata](https://github.com/InfoGata/spotify-audiogata)

[dropbox-audiogata](https://github.com/InfoGata/dropbox-audiogata)

[googledrive-audiogata](https://github.com/InfoGata/googledrive-audiogata)

## Plugin Development

[Docs](https://infogata.github.io/audiogata-plugin-typings/plugins/plugin-manifest)

[Types](https://github.com/InfoGata/audiogata-plugin-typings)
