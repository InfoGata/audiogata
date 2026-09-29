import * as A from "@automerge/automerge";
import type { Album, Artist, Playlist, PlaylistInfo, Track } from "@/plugintypes";

/**
 * The user's library: everything that syncs between devices. It is the only
 * copy on this device too -- there is no Dexie table mirroring it.
 */
export type LibraryDoc = {
  /** Keyed by playlist id. */
  playlists: { [id: string]: Playlist };
  /** Keyed by favoriteKey(), so one item favorited on two devices is one entry. */
  favorites: {
    tracks: { [key: string]: Track };
    albums: { [key: string]: Album };
    artists: { [key: string]: Artist };
    playlists: { [key: string]: PlaylistInfo };
  };
};

export type FavoriteType = keyof LibraryDoc["favorites"];
export type FavoriteItem = Track | Album | Artist | PlaylistInfo;

/**
 * Every device starts its library from these exact bytes rather than from
 * `repo.create()`. Two documents that never shared a first change each create
 * their own `playlists` and `favorites` maps, and merging them keeps only one
 * of each -- the other device's library silently disappears. Starting from a
 * shared first change makes those maps the same objects everywhere, so merges
 * only ever combine what is inside them.
 *
 * Generated once with a fixed actor and `time: 0`:
 *   A.change(A.init({ actor: "0".repeat(32) }), { time: 0, message: "genesis" },
 *     (d) => { d.playlists = {}; d.favorites = { tracks: {}, albums: {}, artists: {}, playlists: {} } })
 * Never regenerate it: a different genesis can't merge with libraries that
 * already exist in the cloud.
 */
const GENESIS_BASE64 =
  "hW9Kg3j0MOMAuAEBEAAAAAAAAAAAAAAAAAAAAAABk8a2/ce5M3cRv6Ju0qrsKsgh5mSSJp6LLlM65XB15uAHAQIDAhMCIwI1CUACVgIJAQQCBBU1IQIjBjQBQgJWAoABAn8AfwF/Bn8AfwdnZW5lc2lzfwB/BwACBAAAAgQCeglmYXZvcml0ZXMJcGxheWxpc3RzBmFsYnVtcwdhcnRpc3RzCXBsYXlsaXN0cwZ0cmFja3MGAH0CfwIDAQYGAAYABgAA";

export const GENESIS_HEADS = [
  "93c6b6fdc7b9337711bfa26ed2aaec2ac821e66492269e8b2e533ae57075e6e0",
];

export const genesisBytes = (): Uint8Array =>
  Uint8Array.from(atob(GENESIS_BASE64), (c) => c.charCodeAt(0));

/** Whether a document descends from the shared genesis, and so can be merged. */
export const isLibraryDoc = (doc: A.Doc<unknown>): boolean =>
  A.hasHeads(doc, GENESIS_HEADS);

export const favoriteKey = (item: FavoriteItem): string | undefined => {
  if (item.pluginId && item.apiId) return `${item.pluginId}:${item.apiId}`;
  return item.id;
};

/**
 * Automerge rejects `undefined`, which plugin data is full of (every optional
 * field a plugin didn't fill in). Drop those keys before storing anything.
 */
export function sanitizeForAutomerge<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForAutomerge(item)) as T;
  }
  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) sanitized[key] = sanitizeForAutomerge(value);
    }
    return sanitized as T;
  }
  return obj;
}

/**
 * Plain copy out of an automerge document. Documents are frozen proxies, and
 * the rest of the app mutates what it's given (setting `id`, `pluginId`, ...).
 */
export const toPlain = <T>(value: T): T =>
  value === undefined ? value : JSON.parse(JSON.stringify(value));
