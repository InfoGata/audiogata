import { Capacitor } from "@capacitor/core";
import isElectron from "is-electron";
import { customAlphabet } from "nanoid";
import i18next from "./i18n";
import { ImageInfo, Manifest, PluginInfo, Track } from "./plugintypes";
import { DirectoryFile, FileType } from "./types";
import semverGte from "semver/functions/gte";

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
): string | undefined => {
  if (!images) {
    return;
  }

  const sortedImages = [...images].sort(
    (a, b) => (a.height || 0) - (b.height || 0)
  );
  const thumbnailImage = sortedImages.find((i) => (i.height || 0) >= size);
  return thumbnailImage ? thumbnailImage.url : sortedImages[0]?.url;
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
  const fileType: FileType = {
    url: {
      url: url,
    },
  };

  return fileType;
}

export async function getFileText(
  fileType: FileType,
  name: string,
  suppressErrors = false
): Promise<string | null> {
  if (fileType.filelist) {
    const file = getFileByDirectoryAndName(fileType.filelist, name);
    if (!file) {
      if (!suppressErrors) {
        const errorText = i18next.t("common:fileNotFound", { name });
        alert(errorText);
      }
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
      if (!suppressErrors) {
        const errorText = i18next.t("common:cantGetFile", { name });
        alert(errorText);
      }
      return null;
    }
  }
  return null;
}

export async function getPlugin(
  fileType: FileType,
  suppressErrors = false
): Promise<PluginInfo | null> {
  const manifestText = await getFileText(fileType, "manifest.json");
  if (!manifestText) return null;

  const manifest = JSON.parse(manifestText) as Manifest;
  if (!manifest.script) {
    if (!suppressErrors) {
      const errorText = i18next.t("common:manifestNoScript");
      alert(errorText);
    }
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
    manifestUrl: manifest.updateUrl || fileType.url?.url,
    homepage: manifest.homepage,
    manifest,
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

const getPluginSubdomain = (id?: string): string => {
  if (import.meta.env.PROD || Capacitor.isNativePlatform()) {
    const domain = import.meta.env.VITE_DOMAIN || "audiogata.com";
    const protocol = domain.startsWith("localhost")
      ? window.location.protocol
      : "https:";
    return `${protocol}//${id}.${domain}`;
  }
  return `${window.location.protocol}//${id}.${window.location.host}`;
};

export const getPluginUrl = (id: string, path: string): URL => {
  return import.meta.env.VITE_UNSAFE_SAME_ORIGIN_IFRAME === "true"
    ? new URL(path, window.location.origin)
    : new URL(`${getPluginSubdomain(id)}${path}`);
};

export const hasExtension = () => {
  return typeof window.InfoGata !== "undefined";
};

export const corsIsDisabled = () => {
  return hasExtension() || isElectron() || Capacitor.isNativePlatform();
};

export const hasAuthentication = async () => {
  const minVersion = "1.1.0";
  if (hasExtension() && window.InfoGata?.getVersion) {
    const version = await window.InfoGata.getVersion();
    return semverGte(version, minVersion);
  }
  return Capacitor.isNativePlatform() || isElectron();
};

export const generatePluginId = () => {
  // Cannot use '-' or '_' if they show up and beginning or end of id.
  const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    21
  );
  return nanoid();
};

// Merge tracks, arr1 and arr2 have tracks with the same id, take arr2's track
export const mergeTracks = (arr1: Track[], arr2: Track[]): Track[] => {
  const map = new Map<string, Track>();
  arr1.forEach((t) => {
    if (t.id) {
      map.set(t.id, t);
    }
  });
  arr2.forEach((t) => {
    if (t.id) {
      map.set(t.id, t);
    }
  });
  return Array.from(map.values());
};

export const defaultSkipTime = 10;

export const navbarWidth = 200;

export const searchThumbnailSize = 40;

export const playlistThumbnailSize = 200;

export const playerThumbnailSize = 70;
