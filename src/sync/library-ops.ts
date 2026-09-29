/**
 * Edits to the library document, as functions over the document inside a
 * `handle.change`. Kept apart from the repo so tests can run them against a
 * bare automerge document.
 *
 * Everything here edits in place rather than replacing whole values: two
 * devices that each add a track to the same playlist must both keep theirs
 * after a merge, which only happens when each change touches just the entries
 * it meant to.
 */
import { nanoid } from "@reduxjs/toolkit";
import type { Playlist, PlaylistInfo, Track } from "@/plugintypes";
import {
  favoriteKey,
  sanitizeForAutomerge,
  type FavoriteItem,
  type FavoriteType,
  type LibraryDoc,
} from "./library-doc";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Make `target` equal `source`, writing only the fields that differ. */
function updateObject(target: Record<string, unknown>, source: object) {
  const clean = sanitizeForAutomerge(source) as Record<string, unknown>;
  for (const key of Object.keys(target)) {
    if (!(key in clean)) delete target[key];
  }
  for (const [key, value] of Object.entries(clean)) {
    if (!same(target[key], value)) target[key] = value;
  }
}

const withIds = (tracks: Track[]): Track[] =>
  tracks.map((t) => (t.id ? t : { ...t, id: nanoid() }));

/**
 * Turn `list` into `next` with the fewest list edits: remove what's gone,
 * move what moved, insert what's new, and update changed tracks field by field.
 */
export function setTrackList(list: Track[], next: Track[]) {
  const nextIds = new Set(next.map((t) => t.id));
  for (let i = list.length - 1; i >= 0; i--) {
    if (!nextIds.has(list[i].id)) list.splice(i, 1);
  }
  next.forEach((want, i) => {
    const current = list[i];
    if (current && current.id === want.id) {
      updateObject(current as unknown as Record<string, unknown>, want);
      return;
    }
    const from = list.findIndex((t, j) => j > i && t.id === want.id);
    if (from !== -1) list.splice(from, 1);
    list.splice(i, 0, sanitizeForAutomerge(want));
  });
  if (list.length > next.length) list.splice(next.length);
}

const infoFields = (info: PlaylistInfo): PlaylistInfo => {
  const { tracks: _tracks, ...rest } = info as Playlist;
  return rest;
};

export const addPlaylist = (doc: LibraryDoc, playlist: Playlist): string => {
  const id = nanoid();
  doc.playlists[id] = sanitizeForAutomerge({
    ...playlist,
    id,
    tracks: withIds(playlist.tracks ?? []),
  });
  return id;
};

/** Add playlists, replacing any that already have the same id. */
export const putPlaylists = (doc: LibraryDoc, playlists: Playlist[]) => {
  for (const playlist of playlists) {
    const id = playlist.id || nanoid();
    const existing = doc.playlists[id];
    const tracks = withIds(playlist.tracks ?? []);
    if (existing) {
      updatePlaylist(doc, { ...playlist, id });
      setTrackList(existing.tracks, tracks);
    } else {
      doc.playlists[id] = sanitizeForAutomerge({ ...playlist, id, tracks });
    }
  }
};

export const deletePlaylist = (doc: LibraryDoc, id: string) => {
  delete doc.playlists[id];
};

/** Update a playlist's name and details; its tracks are left alone. */
export const updatePlaylist = (doc: LibraryDoc, info: PlaylistInfo) => {
  const playlist = info.id ? doc.playlists[info.id] : undefined;
  if (!playlist) return;
  const target = playlist as unknown as Record<string, unknown>;
  const clean = sanitizeForAutomerge(infoFields(info)) as Record<string, unknown>;
  for (const key of Object.keys(target)) {
    if (key !== "tracks" && !(key in clean)) delete target[key];
  }
  for (const [key, value] of Object.entries(clean)) {
    if (!same(target[key], value)) target[key] = value;
  }
};

/** Append tracks, updating in place any the playlist already has. */
export const addPlaylistTracks = (
  doc: LibraryDoc,
  playlistId: string,
  tracks: Track[]
) => {
  const playlist = doc.playlists[playlistId];
  if (!playlist) return;
  for (const track of withIds(tracks)) {
    const existing = playlist.tracks.find((t) => t.id === track.id);
    if (existing) {
      updateObject(existing as unknown as Record<string, unknown>, track);
    } else {
      playlist.tracks.push(sanitizeForAutomerge(track));
    }
  }
};

export const setPlaylistTracks = (
  doc: LibraryDoc,
  playlistId: string,
  tracks: Track[]
) => {
  const playlist = doc.playlists[playlistId];
  if (!playlist) return;
  setTrackList(playlist.tracks, withIds(tracks));
};

export const addFavorites = (
  doc: LibraryDoc,
  type: FavoriteType,
  items: FavoriteItem[]
) => {
  const table = doc.favorites[type] as Record<string, FavoriteItem>;
  for (const item of items) {
    const withId = item.id ? item : { ...item, id: nanoid() };
    const key = favoriteKey(withId);
    if (key && !table[key]) table[key] = sanitizeForAutomerge(withId);
  }
};

export const removeFavorite = (
  doc: LibraryDoc,
  type: FavoriteType,
  item: FavoriteItem
) => {
  const table = doc.favorites[type] as Record<string, FavoriteItem>;
  const key = favoriteKey(item);
  if (key && table[key]) {
    delete table[key];
    return;
  }
  // Fall back to the id for items that reached here without their plugin ids.
  const byId = Object.entries(table).find(([, v]) => item.id && v.id === item.id);
  if (byId) delete table[byId[0]];
};

export const isFavorite = (
  doc: LibraryDoc | undefined,
  type: FavoriteType,
  item: FavoriteItem
): boolean => {
  if (!doc) return false;
  const table = doc.favorites[type] as Record<string, FavoriteItem>;
  const key = favoriteKey(item);
  if (key && table[key]) return true;
  return !!item.id && Object.values(table).some((v) => v.id === item.id);
};
