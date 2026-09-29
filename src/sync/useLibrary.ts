import React from "react";
import type { Playlist, PlaylistInfo } from "@/plugintypes";
import { LibraryContext, cloudSyncManager } from "./LibraryContext";
import { toPlaylistInfo } from "./library";
import {
  toPlain,
  type FavoriteItem,
  type FavoriteType,
  type LibraryDoc,
} from "./library-doc";
import { isFavorite } from "./library-ops";
import type { SyncState } from "./cloud/CloudSyncManager";

export const useLibrary = (): LibraryDoc => {
  const doc = React.useContext(LibraryContext);
  if (!doc) throw new Error("useLibrary must be used inside LibraryProvider");
  return doc;
};

/** Every playlist, without its tracks. */
export const usePlaylists = (): PlaylistInfo[] => {
  const { playlists } = useLibrary();
  return React.useMemo(
    () => toPlain(Object.values(playlists).map(toPlaylistInfo)),
    [playlists]
  );
};

export const usePlaylist = (id: string): Playlist | undefined => {
  const playlist = useLibrary().playlists[id];
  return React.useMemo(() => toPlain(playlist), [playlist]);
};

export const useFavorites = <T extends FavoriteType>(
  type: T
): LibraryDoc["favorites"][T][string][] => {
  const table = useLibrary().favorites[type];
  return React.useMemo(
    () => toPlain(Object.values(table)) as LibraryDoc["favorites"][T][string][],
    [table]
  );
};

export const useIsFavorite = (type: FavoriteType, item: FavoriteItem) =>
  isFavorite(useLibrary(), type, item);

export const useCloudSyncState = (): SyncState =>
  React.useSyncExternalStore(
    (onChange) => cloudSyncManager.subscribe(onChange),
    () => cloudSyncManager.getState()
  );
