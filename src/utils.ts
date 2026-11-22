import { Capacitor } from "@capacitor/core";
import isElectron from "is-electron";
import { customAlphabet } from "nanoid";
import i18next from "./i18n";
import semverValid from "semver/functions/parse";
import { Manifest, PluginInfo } from "./plugintypes";
import { DirectoryFile, FileType } from "./types";
import semverGte from "semver/functions/gte";
import { toast } from "sonner";
import { hasExtension } from "@infogata/extension-components";

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
        toast.error(errorText);
      }
      return null;
    }

    return await file.text();
  } else if (fileType.url) {
    const encodedName = encodeURIComponent(name);
    const newUrl = fileType.url.url.replace("manifest.json", encodedName);
    try {
      // Revalidate rather than trust the browser's copy. jsdelivr serves the
      // mutable @latest refs with `max-age=604800`, so without this an update
      // check can be answered from a week-old cache, and purging the CDN can't
      // help: the stale copy is in the user's own browser. "no-cache" costs a
      // conditional request answered 304 when nothing changed. Applied to every
      // plugin file, since the manifest and the script it names are separate
      // cache entries and letting either go stale pairs a version with code
      // that isn't it.
      const result = await fetch(newUrl, {
        headers: fileType.url.headers,
        cache: "no-cache",
      });
      return await result.text();
    } catch {
      if (!suppressErrors) {
        const errorText = i18next.t("common:cantGetFile", { name });
        toast.error(errorText);
      }
      return null;
    }
  }
  return null;
}

// cdn.jsdelivr.net/gh/<owner>/<repo>[@<ref>]/<path>
const JSDELIVR_GH_URL =
  /^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^/@]+\/[^/@]+)(?:@([^/]+))?(\/.*)$/;
// Refs that already name one fixed build: a version or a commit.
const FIXED_REF = /^(v?\d+(\.\d+){0,2}([-+].*)?|[0-9a-f]{7,40})$/;

/**
 * The same manifest url pinned to the release `version`, when it is a jsdelivr
 * GitHub url on a moving ref (`@latest`, a branch, or no ref at all).
 *
 * The manifest has to come from the moving ref, since that is how a new version
 * is found. The files it names don't: jsdelivr caches each url separately, so
 * for a while after a release one edge can serve the new manifest beside the
 * old script. The update is then recorded as done and never retried. A tag's
 * url can only ever be that tag's build -- jsdelivr resolves `@1.8.1` to the
 * tag `1.8.1` or `v1.8.1` -- so the version and its code can't come apart.
 * Same as SocialGata's `getPinnedFileType`; keep them in step.
 */
export function getPinnedFileType(
  fileType: FileType,
  version: string | undefined
): FileType | undefined {
  if (!fileType.url || !version || !semverValid(version)) return undefined;
  const match = JSDELIVR_GH_URL.exec(fileType.url.url);
  if (!match) return undefined;
  const [, repo, ref, path] = match;
  if (ref && FIXED_REF.test(ref)) return undefined;
  return {
    url: { ...fileType.url, url: `${repo}@${version}${path}` },
  };
}

/**
 * A file of the release, from the pinned url when there is one.
 *
 * Only a 404 -- the repo doesn't tag its releases -- falls back to the moving
 * ref, which is how every plugin was fetched before. Anything else gives up:
 * falling back then would risk the very mismatch pinning prevents, and a
 * missed update is simply tried again on the next check.
 */
async function getReleaseFileText(
  fileType: FileType,
  pinned: FileType | undefined,
  name: string
): Promise<string | null> {
  if (!pinned?.url) return getFileText(fileType, name);
  const url = pinned.url.url.replace("manifest.json", encodeURIComponent(name));
  try {
    // No "no-cache" here: a tagged url never changes, so the browser's copy
    // is always the right one.
    const result = await fetch(url, { headers: pinned.url.headers });
    if (result.ok) return await result.text();
    if (result.status === 404) return getFileText(fileType, name);
  } catch {
    // Fall through to the error below.
  }
  toast.error(i18next.t("common:cantGetFile", { name }));
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
      toast.error(errorText);
    }
    return null;
  }

  const pinned = getPinnedFileType(fileType, manifest.version);
  const script = await getReleaseFileText(fileType, pinned, manifest.script);
  if (!script) return null;

  const plugin: PluginInfo = {
    id: manifest.id,
    // Only what the manifest asked for. The effective alias is assigned on
    // install, since another plugin may already hold this one.
    alias: manifest.alias,
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
    const optionsText = await getReleaseFileText(fileType, pinned, optionsFile);
    if (!optionsText) return null;

    if (typeof manifest.options !== "string") {
      plugin.optionsSameOrigin = manifest.options.sameOrigin;
    }
    plugin.optionsHtml = optionsText;
  }

  return plugin;
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

// Re-exported so the rest of the app keeps importing detection from one place.
// The shared version also honours `?noextension`, which makes the app behave as
// if the extension were not installed -- the only way to exercise that path in
// a browser that has it.
export { hasExtension };

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

export const isCorsDisabled = () => {
  return hasExtension() || isElectron() || Capacitor.isNativePlatform();
}


export const defaultSkipTime = 10;

export const navbarWidth = 200;

export const searchThumbnailSize = 40;

export const playlistThumbnailSize = 200;

export const playerThumbnailSize = 70;
