export interface PluginDescription {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const defaultPlugins: PluginDescription[] = [
  {
    id: "5WWSzBORLfZgym533u87I",
    name: "Plugin for Youtube",
    description: "Plugin for playing music from youtube.com",
    url: "https://gitlab.com/api/v4/projects/26680847/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "B9-GwavJJOQpQXotpLZH-",
    name: "Plugin for SoundCloud",
    description: "Play music from SoundCloud.",
    url: "https://gitlab.com/api/v4/projects/38039113/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "uIAyZ62xBHMEY3cwti8AN",
    name: "Plugin for Spotify",
    description: "Play music from Spotify. Requires Spotify login.",
    url: "https://gitlab.com/api/v4/projects/35723151/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "4tbwYICEMHms82I7omxPz",
    name: "Plugin for Napster",
    description: "Play music from napster. Requires napster login.",
    url: "https://gitlab.com/api/v4/projects/35720504/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "05KGl-ijn6XN-NMCaqy-x",
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://gitlab.com/api/v4/projects/35748829/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "CKLZjstjyBrAexuRI_hn7",
    name: "Plugin for Dropbox",
    description: "Store and retreive playlists from Dropbox",
    url: "https://gitlab.com/api/v4/projects/35751390/repository/files/manifest.json/raw?ref=master",
  },
];

export const defaultPluginMap = new Map(defaultPlugins.map((p) => [p.id, p]));
