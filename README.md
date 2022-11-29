# AudioGata

A plugin based web app that plays audio.

https://www.audiogata.com

## Running locally

```console
npm install
npm run dev
```

## Plugins

The plugin scripts are run in sandboxed iframes using [plugin-frame](https://github.com/elijahgreen/plugin-frame). Every iframe is ran on it's own subdomain with it's subdomain being the id of the plugin ([pluginId].audiogata.com).

[youtube-audiogata](https://github.com/InfoGata/youtube-audiogata)

[soundcloud-audiogata](https://github.com/InfoGata/soundcloud-audiogata)

[napster-audiogata](https://github.com/InfoGata/napster-audiogata)

[spotify-audiogata](https://github.com/InfoGata/spotify-audiogata)

[dropbox-audiogata](https://github.com/InfoGata/dropbox-audiogata)

[googledrive-audiogata](https://github.com/InfoGata/googledrive-audiogata)

## Plugin Development

[Docs](https://infogata.github.io/audiogata-plugin-typings/plugins/plugin-manifest/)

[Types](https://github.com/InfoGata/audiogata-plugin-typings)
