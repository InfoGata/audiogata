import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { nanoid } from "@reduxjs/toolkit";
import isElectron from "is-electron";
import { useSnackbar } from "notistack";
import { PluginInterface } from "plugin-frame";
import React from "react";
import { useTranslation } from "react-i18next";
import semverGt from "semver/functions/gt";
import semverValid from "semver/functions/parse";
import PluginsContext, {
  PluginContextInterface,
  PluginFrameContainer,
  PluginMessage,
  PluginMethodInterface,
} from "../PluginsContext";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import { db } from "../database";
import i18n from "../i18n";
import {
  AlbumTracksResult,
  ArtistAlbumsResult,
  NotificationMessage,
  Playlist,
  PlaylistInfo,
  PluginInfo,
  SearchAlbumResult,
  SearchAllResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchTrackResult,
  Track,
} from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addPlaylistTracks,
  addPlaylists,
} from "../store/reducers/playlistReducer";
import {
  nextTrack,
  setElapsed,
  setTracks,
} from "../store/reducers/trackReducer";
import { Manifest, NetworkRequest } from "../types";
import {
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  getPluginSubdomain,
  hasExtension,
  mapAsync,
} from "../utils";
import { setLyricsPluginId } from "../store/reducers/settingsReducer";

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<NetworkRequest>;
  postUiMessage(message: any): Promise<void>;
  isNetworkRequestCorsDisabled(): Promise<boolean>;
  endTrack(): Promise<void>;
  setTrackTime(currentTime: number): Promise<void>;
  getNowPlayingTracks(): Promise<Track[]>;
  setNowPlayingTracks(tracks: Track[]): Promise<void>;
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistsInfo(): Promise<PlaylistInfo[]>;
  addPlaylists(playlists: Playlist[]): Promise<void>;
  addTracksToPlaylist(playlistId: string, tracks: Track[]): Promise<void>;
  createNotification(notification: NotificationMessage): Promise<void>;
  getCorsProxy(): Promise<string | undefined>;
  installPlugins(plugins: PluginInfo[]): Promise<void>;
  getPlugins(): Promise<PluginInfo[]>;
  getPluginId(): Promise<string>;
  getLocale(): Promise<string>;
}

function iteratorFor(items: any) {
  var iterator = {
    next: function () {
      var value = items.shift();
      return { done: value === undefined, value: value };
    },
    [Symbol.iterator]: () => {
      return iterator;
    },
  };

  return iterator;
}

const getHeaderEntries = (
  headers: Headers
): IterableIterator<[string, string]> => {
  var items: string[][] = [];
  headers.forEach(function (value, name) {
    items.push([name, value]);
  });
  return iteratorFor(items);
};

const PluginsProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [pluginsLoaded, setPluginsLoaded] = React.useState(false);
  const hasUpdated = React.useRef(false);

  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();
  const [pluginsFailed, setPluginsFailed] = React.useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation("plugins");

  const lyricsPluginId = useAppSelector(
    (state) => state.settings.lyricsPluginId
  );
  const loadingPlugin = React.useRef(false);

  // Store variables being used by plugin methods in refs
  // in order to not get stale state
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const currentTrackRef = React.useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const tracks = useAppSelector((state) => state.track.tracks);
  const tracksRef = React.useRef(tracks);
  tracksRef.current = tracks;
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const corsProxyUrlRef = React.useRef(corsProxyUrl);
  corsProxyUrlRef.current = corsProxyUrl;
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const playlistsRef = React.useRef(playlists);
  playlistsRef.current = playlists;
  const disableAutoUpdatePlugins = useAppSelector(
    (state) => state.settings.disableAutoUpdatePlugins
  );

  const { enqueueSnackbar } = useSnackbar();
  const [pendingPlugins, setPendingPlugins] = React.useState<
    PluginInfo[] | null
  >(null);

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        networkRequest: async (input: RequestInfo, init?: RequestInit) => {
          if (hasExtension()) {
            return await window.InfoGata.networkRequest(input, init);
          }

          const response = Capacitor.isNativePlatform()
            ? await window.cordovaFetch(input, init)
            : await fetch(input, init);

          const body = await response.blob();

          // cordova-plugin-fetch does not support Headers.entries
          const responseHeaders = Capacitor.isNativePlatform()
            ? Object.fromEntries(getHeaderEntries(response.headers))
            : Object.fromEntries(response.headers.entries());

          // Remove forbidden header
          if (responseHeaders["set-cookie"]) {
            delete responseHeaders["set-cookie"];
          }

          const result = {
            body: body,
            headers: responseHeaders,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          };
          return result;
        },
        isNetworkRequestCorsDisabled: async () => {
          const isDisabled =
            hasExtension() || isElectron() || Capacitor.isNativePlatform();
          return isDisabled;
        },
        postUiMessage: async (message: any) => {
          setPluginMessage({ pluginId: plugin.id, message });
        },
        endTrack: async () => {
          const track = currentTrackRef.current;
          if (track?.pluginId === plugin.id) {
            dispatch(nextTrack());
          }
        },
        setTrackTime: async (currentTime: number) => {
          const track = currentTrackRef.current;
          if (track?.pluginId === plugin.id) {
            dispatch(setElapsed(currentTime));
          }
        },
        getNowPlayingTracks: async () => {
          return tracksRef.current;
        },
        setNowPlayingTracks: async (tracks: Track[]) => {
          dispatch(setTracks(tracks));
        },
        createNotification: async (notification: NotificationMessage) => {
          enqueueSnackbar(notification.message, { variant: notification.type });
        },
        getCorsProxy: async () => {
          if (import.meta.env.PROD || corsProxyUrlRef.current) {
            return corsProxyUrlRef.current;
          } else {
            return "http://localhost:8085/";
          }
        },
        getPlugins: async () => {
          const plugs = await db.plugins.toArray();
          return plugs;
        },
        installPlugins: async (plugins: PluginInfo[]) => {
          setPendingPlugins(plugins);
        },
        getPluginId: async () => {
          return plugin.id || "";
        },
        getPlaylists: async () => {
          return await db.playlists.toArray();
        },
        getPlaylistsInfo: async () => {
          return playlistsRef.current;
        },
        addPlaylists: async (playlists: Playlist[]) => {
          dispatch(addPlaylists(playlists));
        },
        addTracksToPlaylist: async (playlistId: string, tracks: Track[]) => {
          tracks.forEach((t) => {
            if (!t.pluginId) {
              t.pluginId = plugin.id;
            }
          });
          const playlist = playlistsRef.current.find(
            (p) => p.id === playlistId
          );
          if (playlist) {
            dispatch(addPlaylistTracks(playlist, tracks));
          }
        },
        getLocale: async () => {
          return i18n.language;
        },
      };

      const srcUrl = `${getPluginSubdomain(plugin.id)}/pluginframe.html`;

      const completeMethods: {
        [key in keyof PluginMethodInterface]?: (
          arg: any
        ) =>
          | ReturnType<PluginMethodInterface[key]>
          | Awaited<ReturnType<PluginMethodInterface[key]>>;
      } = {
        onGetTrack: (result: Track) => {
          result.pluginId = plugin.id;
          return result;
        },
        onSearchAll: (result: SearchAllResult) => {
          result.tracks?.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          result.albums?.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          result.artists?.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          result.playlists?.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchTracks: (result: SearchTrackResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchArtists: (result: SearchArtistResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchAlbums: (result: SearchAlbumResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchPlaylists: (result: SearchPlaylistResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetPlaylistTracks: (result: SearchTrackResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetTopItems: (result: SearchAllResult) => {
          result.tracks?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          result.albums?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          result.artists?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          result.playlists?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onGetUserPlaylists: (result: SearchPlaylistResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetAlbumTracks: (result: AlbumTracksResult) => {
          if (result.album) {
            result.album.id = nanoid();
            result.album.pluginId = plugin.id;
          }
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onGetArtistAlbums: (result: ArtistAlbumsResult) => {
          if (result.artist) {
            result.artist.id = nanoid();
            result.artist.pluginId = plugin.id;
          }
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onLookupPlaylistUrl: (result: Playlist) => {
          result.id = nanoid();
          result.pluginId = plugin.id;
          result.tracks.forEach((t) => {
            t.id = nanoid();
            t.pluginId = plugin.id;
          });
          return result;
        },
        onLookupTrackUrls: (result: Track[]) => {
          result.forEach((t) => {
            t.id = nanoid();
            t.pluginId = plugin.id;
          });
          return result;
        },
        onLookupTrack: (track: Track) => {
          track.pluginId = plugin.id;
          return track;
        },
      };

      const host = new PluginFrameContainer(api, {
        completeMethods,
        frameSrc: new URL(srcUrl),
        sandboxAttributes: ["allow-scripts", "allow-same-origin"],
        allow: "encrypted-media; autoplay;",
      });
      host.id = plugin.id;
      host.optionsSameOrigin = plugin.optionsSameOrigin;
      host.name = plugin.name;
      host.version = plugin.version;
      host.hasOptions = !!plugin.optionsHtml;
      host.fileList = pluginFiles;
      host.manifestUrl = plugin.manifestUrl;
      const timeoutMs = 10000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(), timeoutMs);
      });
      await Promise.race([host.ready(), timeoutPromise]);
      await host.executeCode(plugin.script);
      return host;
    },
    [dispatch, enqueueSnackbar]
  );

  const loadPlugins = React.useCallback(async () => {
    setPluginsFailed(false);
    try {
      const plugs = await db.plugins.toArray();

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      setPluginFrames(frames);
    } catch {
      enqueueSnackbar(t("failedPlugins"), { variant: "error" });
      setPluginsFailed(true);
    } finally {
      setPluginsLoaded(true);
    }
  }, [loadPlugin, enqueueSnackbar, t]);

  React.useEffect(() => {
    if (loadingPlugin.current) return;
    loadingPlugin.current = true;
    loadPlugins();
  }, [loadPlugins]);

  React.useEffect(() => {
    App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
      if (event.url.startsWith("com.audiogata.app://message")) {
        const url = new URL(event.url);
        const pluginId = url.searchParams.get("pluginId");
        const plugin = pluginFrames.find((p) => p.id === pluginId);
        if (plugin) {
          const message = url.searchParams.get("message");
          if (await plugin.hasDefined.onDeepLinkMessage()) {
            await plugin.remote.onDeepLinkMessage(message || "");
          }
        }
      }
    });
  }, [pluginFrames]);

  const addPlugin = async (plugin: PluginInfo) => {
    if (pluginFrames.some((p) => p.id === plugin.id)) {
      enqueueSnackbar(t("pluginAlreadyInstalled", { id: plugin.id }));
      return;
    }

    const pluginFrame = await loadPlugin(plugin);
    setPluginFrames([...pluginFrames, pluginFrame]);
    await db.plugins.add(plugin);
    if (!lyricsPluginId && (await pluginFrame.hasDefined.onGetLyrics())) {
      dispatch(setLyricsPluginId(pluginFrame.id));
    }
  };

  const updatePlugin = React.useCallback(
    async (plugin: PluginInfo, id: string, pluginFiles?: FileList) => {
      const oldPlugin = pluginFrames.find((p) => p.id === id);
      oldPlugin?.destroy();
      const pluginFrame = await loadPlugin(plugin, pluginFiles);
      setPluginFrames(pluginFrames.map((p) => (p.id === id ? pluginFrame : p)));
      await db.plugins.put(plugin);
    },
    [loadPlugin, pluginFrames]
  );

  const deletePlugin = async (pluginFrame: PluginFrameContainer) => {
    const newPlugins = pluginFrames.filter((p) => p.id !== pluginFrame.id);
    if (pluginFrame.id === lyricsPluginId) {
      dispatch(setLyricsPluginId(undefined));
    }
    setPluginFrames(newPlugins);
    await db.plugins.delete(pluginFrame.id || "");
  };

  React.useEffect(() => {
    const checkUpdate = async () => {
      if (pluginsLoaded && !disableAutoUpdatePlugins && !hasUpdated.current) {
        hasUpdated.current = true;
        await mapAsync(pluginFrames, async (p) => {
          // Don't update current track's plugin
          if (currentTrack?.pluginId === p.id) {
            return;
          }

          if (p.manifestUrl) {
            const fileType = getFileTypeFromPluginUrl(p.manifestUrl);
            const manifestText = await getFileText(fileType, "manifest.json");
            if (manifestText) {
              const manifest = JSON.parse(manifestText) as Manifest;
              if (
                manifest.version &&
                p.version &&
                semverValid(manifest.version) &&
                semverValid(p.version) &&
                semverGt(manifest.version, p.version)
              ) {
                const newPlugin = await getPlugin(fileType);

                if (newPlugin && p.id) {
                  newPlugin.id = p.id;
                  newPlugin.manifestUrl = p.manifestUrl;
                  await updatePlugin(newPlugin, p.id);
                }
              }
            }
          }
        });
      }
    };
    checkUpdate();
  }, [
    pluginsLoaded,
    pluginFrames,
    currentTrack,
    disableAutoUpdatePlugins,
    updatePlugin,
  ]);

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    plugins: pluginFrames,
    pluginMessage: pluginMessage,
    pluginsLoaded,
    pluginsFailed,
    reloadPlugins: loadPlugins,
  };

  const handleClose = () => {
    setPendingPlugins(null);
  };
  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
      <ConfirmPluginDialog
        open={Boolean(pendingPlugins)}
        plugins={pendingPlugins || []}
        handleClose={handleClose}
      />
    </PluginsContext.Provider>
  );
};

export default PluginsProvider;
