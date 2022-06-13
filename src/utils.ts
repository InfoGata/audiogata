import { DirectoryFile, FileType, Manifest } from "./types";
import thumbnail from "./thumbnail.png";
import { ImageInfo, PluginInfo } from "./plugintypes";

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
  images: ImageInfo[] | undefined,
  size: number
): string => {
  if (!images) {
    return thumbnail;
  }

  const sortedImages = [...images].sort((a, b) => a.height - b.height);
  const thumbnailImage = sortedImages.find((i) => i.height >= size);
  return thumbnailImage ? thumbnailImage.url : sortedImages[0].url;
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

export function getFileTypeFromPluginUrl(url: string) {
  const headers = new Headers();
  if (process.env.REACT_APP_GITLAB_ACCESS_TOKEN) {
    headers.append("PRIVATE-TOKEN", process.env.REACT_APP_GITLAB_ACCESS_TOKEN);
  }
  const fileType: FileType = {
    url: {
      url: url,
      headers: headers,
    },
  };

  return fileType;
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
    id: manifest.id,
    name: manifest.name,
    script,
    description: manifest.description,
    version: manifest.version,
  };

  if (manifest.options) {
    const optionsFile =
      typeof manifest.options === "string"
        ? manifest.options
        : manifest.options.page;
    const optionsText = await getFileText(fileType, optionsFile);
    if (!optionsText) return null;

    if (typeof manifest.options !== "string") {
      plugin.optionsSameOrigin = manifest.options.sameOrigin;
    }
    plugin.optionsHtml = optionsText;
  }

  return plugin;
}

export function mapAsync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(callbackfn));
}

export async function filterAsync<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((_value, index) => filterMap[index]);
}

export const isElectron = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf(" electron/") > -1;
};

export const navbarWidth = 200;

export const searchThumbnailSize = 40;

export const playlistThumbnailSize = 200;
