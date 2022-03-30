import {
  DirectoryFile,
  FileType,
  IImage,
  Manifest,
  PluginInfo,
} from "./models";
import { ISearchApi } from "./plugins/ISearchApi";
import thumbnail from "./thumbnail.png";
import Spotify from "./plugins/spotify";
import SpotifyPlayer from "./plugins/spotify";
import { IPlayerComponent } from "./plugins/IPlayerComponent";

export function formatSeconds(seconds?: number) {
  if (!seconds) {
    return "00:00";
  }
  const hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  seconds = Math.floor(seconds);
  let result =
    (minutes < 10 ? "0" : "") +
    minutes +
    ":" +
    (seconds < 10 ? "0" : "") +
    seconds;

  if (hours > 0) {
    result = hours + ":" + result;
  }
  return result;
}

// Retreive smallest image bigger than thumbnail size
export const getThumbnailImage = (
  images: IImage[] | undefined,
  size: number
): string => {
  if (!images) {
    return thumbnail;
  }

  const sortedImages = [...images].sort((a, b) => a.height - b.height);
  const thumbnailImage = sortedImages.find((i) => i.height >= size);
  return thumbnailImage ? thumbnailImage.url : thumbnail;
};

export const getApiByName = (name: string): ISearchApi | undefined => {
  switch (name) {
    case "spotify":
      return Spotify;
  }
};

export const getPlayerFromName = (
  name: string
): IPlayerComponent | undefined => {
  switch (name) {
    case "spotify":
      return SpotifyPlayer;
  }
  return undefined;
};

export const directoryProps = {
  directory: "",
  webkitdirectory: "",
  mozdirectory: "",
};

export function getFileByDirectoryAndName(files: FileList, name: string) {
  if (files.length === 0) {
    return null;
  }
  const firstFile = files[0] as DirectoryFile;
  const directory = firstFile.webkitRelativePath.split("/")[0];
  for (let i = 0; i < files.length; i++) {
    const file = files[i] as DirectoryFile;
    if (file.webkitRelativePath === `${directory}/${name}`) {
      return file;
    }
  }
  return null;
}

export async function getFileText(
  fileType: FileType,
  name: string
): Promise<string | null> {
  if (fileType.filelist) {
    const file = getFileByDirectoryAndName(fileType.filelist, name);
    if (!file) {
      alert(`Error: Couldn't find ${name}`);
      return null;
    }

    return await file.text();
  } else if (fileType.url) {
    const encodedName = encodeURIComponent(name);
    const newUrl = fileType.url.url.replace("manifest.json", encodedName);
    try {
      const result = await fetch(newUrl, { headers: fileType.url.headers });
      return await result.text();
    } catch {
      alert(`Error: Couldn't get ${name}`);
      return null;
    }
  }
  return null;
}

export async function getPlugin(
  fileType: FileType
): Promise<PluginInfo | null> {
  const manifestText = await getFileText(fileType, "manifest.json");
  if (!manifestText) return null;

  const manifest = JSON.parse(manifestText) as Manifest;
  if (!manifest.script) {
    alert("Error: Manifest does not contain script");
    return null;
  }

  const script = await getFileText(fileType, manifest.script);
  if (!script) return null;

  const plugin: PluginInfo = {
    name: manifest.name,
    script,
    description: manifest.description,
  };

  if (manifest.options) {
    const optionsText = await getFileText(fileType, manifest.options);
    if (!optionsText) return null;

    plugin.optionsHtml = optionsText;
  }

  return plugin;
}

export const navbarWidth = 200;

export const searchThumbnailSize = 40;
