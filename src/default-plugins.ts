export interface PluginDescription {
  name: string;
  url: string;
  description: string;
}

export const defaultPlugins: PluginDescription[] = [
  {
    name: "Plugin for Youtube",
    description: "Plugin for playing music from youtube.com",
    url: "https://gitlab.com/api/v4/projects/26680847/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for SoundCloud",
    description: "Play music from SoundCloud.",
    url: "https://gitlab.com/api/v4/projects/38039113/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Spotify",
    description: "Play music from Spotify. Requires Spotify login.",
    url: "https://gitlab.com/api/v4/projects/35723151/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Napster",
    description: "Play music from napster. Requires napster login.",
    url: "https://gitlab.com/api/v4/projects/35720504/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://gitlab.com/api/v4/projects/35748829/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Dropbox",
    description: "Store and retreive playlists from Dropbox",
    url: "https://gitlab.com/api/v4/projects/35751390/repository/files/manifest.json/raw?ref=master",
  },
];
