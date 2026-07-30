import { PluginDescription } from "./types";

export const defaultPlugins: PluginDescription[] = [
  {
    id: "5WWSzBORLfZgym533u87I",
    alias: "youtube",
    name: "Plugin for Youtube",
    description: "Plugin for playing music from youtube.com",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/youtube-audiogata@latest/manifest.json",
    requiresCorsDisabled: true,
  },
  {
    id: "B9-GwavJJOQpQXotpLZH",
    alias: "soundcloud",
    name: "Plugin for SoundCloud",
    description: "Play music from SoundCloud.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/soundcloud-audiogata@latest/manifest.json",
    preinstall: true,
  },
  {
    id: "uIAyZ62xBHMEY3cwti8AN",
    alias: "spotify",
    name: "Plugin for Spotify",
    description: "Play music from Spotify. Requires Spotify login.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/spotify-audiogata@latest/manifest.json",
  },
  {
    id: "4tbwYICEMHms82I7omxPz",
    alias: "napster",
    name: "Plugin for Napster",
    description: "Play music from napster. Requires napster login.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/napster-audiogata@latest/manifest.json",
    hidden: true,
  },
  {
    id: "05KGl-ijn6XN-NMCaqy-x",
    alias: "google-drive",
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/googledrive-audiogata@latest/manifest.json",
  },
  {
    id: "CKLZjstjyBrAexuRI_hn7",
    alias: "dropbox",
    name: "Plugin for Dropbox",
    description: "Store and retreive playlists from Dropbox",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/dropbox-audiogata@latest/manifest.json",
  },
  {
    id: "6c9178c6-5118-11ee-be56-0242ac120002",
    alias: "azlyrics",
    name: "Plugin for Azlyrics",
    description: "Get lyrics from azlyrics.com",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/azlyrics-audiogata@latest/manifest.json",
    requiresCorsDisabled: true
  }
];

export const defaultPluginMap = new Map(defaultPlugins.map((p) => [p.id, p]));

/**
 * A `/s/<alias>/...` url for a plugin that isn't installed can't resolve to an
 * id, so the alias is all we get. Keyed separately from the id map so a url
 * still finds the plugin it names and can offer to install it.
 */
export const defaultPluginAliasMap = new Map(
  defaultPlugins.map((p) => [p.alias, p])
);
