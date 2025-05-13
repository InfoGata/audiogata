export interface PluginDescription {
  id: string;
  name: string;
  url: string;
  description: string;
  preinstall?: boolean;
}

export const defaultPlugins: PluginDescription[] = [
  {
    id: "5WWSzBORLfZgym533u87I",
    name: "Plugin for Youtube",
    description: "Plugin for playing music from youtube.com",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/youtube-audiogata@latest/manifest.json",
  },
  {
    id: "B9-GwavJJOQpQXotpLZH",
    name: "Plugin for SoundCloud",
    description: "Play music from SoundCloud.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/soundcloud-audiogata@latest/manifest.json",
    preinstall: true,
  },
  {
    id: "uIAyZ62xBHMEY3cwti8AN",
    name: "Plugin for Spotify",
    description: "Play music from Spotify. Requires Spotify login.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/spotify-audiogata@latest/manifest.json",
  },
  {
    id: "4tbwYICEMHms82I7omxPz",
    name: "Plugin for Napster",
    description: "Play music from napster. Requires napster login.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/napster-audiogata@latest/manifest.json",
  },
  {
    id: "05KGl-ijn6XN-NMCaqy-x",
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/googledrive-audiogata@latest/manifest.json",
  },
  {
    id: "CKLZjstjyBrAexuRI_hn7",
    name: "Plugin for Dropbox",
    description: "Store and retreive playlists from Dropbox",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/dropbox-audiogata@latest/manifest.json",
  },
  {
    id: "6c9178c6-5118-11ee-be56-0242ac120002",
    name: "Plugin for Azlyrics",
    description: "Get lyrics from azlyrics.com",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/azlyrics-audiogata@latest/manifest.json",
    preinstall: true,
  },
];

export const defaultPluginMap = new Map(defaultPlugins.map((p) => [p.id, p]));
