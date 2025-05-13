import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { nanoid } from "@reduxjs/toolkit";
import isElectron from "is-electron";
import { PluginInterface } from "plugin-frame";
import React from "react";
import { useTranslation } from "react-i18next";
import semverGt from "semver/functions/gt";
import semverValid from "semver/functions/parse";
import { toast } from "sonner";
import PluginsContext, {
  PluginContextInterface,
  PluginFrameContainer,
  PluginMessage,
  PluginMethodInterface,
} from "../PluginsContext";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import { db } from "../database";
import { defaultPlugins } from "../default-plugins";
import i18n from "../i18n";
import {
  AlbumTracksResult,
  ArtistAlbumsResult,
  Manifest,
  NotificationMessage,
  Playlist,
  PlaylistInfo,
  PluginInfo,
  SearchAlbumResult,
  SearchAllResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchTrackResult,
  Theme,
  Track,
} from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addPlaylistTracks,
  addPlaylists,
} from "../store/reducers/playlistReducer";
import {
  setLyricsPluginId,
  setPluginsPreInstalled,
} from "../store/reducers/settingsReducer";
import {
  nextTrack,
  setElapsed,
  setTracks,
} from "../store/reducers/trackReducer";
import { NetworkRequest } from "../types";
import { mapAsync } from "@infogata/utils";
import {
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  getPluginUrl,
  hasExtension,
} from "../utils";
import { useTheme } from "./ThemeProvider";

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest(input: string, init?: RequestInit): Promise<NetworkRequest>;
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
  isLoggedIn(): Promise<boolean>;
  getTheme(): Promise<Theme>;
}

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

  const pluginsPreinstalled = useAppSelector(
    (state) => state.settings.pluginsPreinstalled
  );
  const [preinstallComplete, setPreinstallComplete] =
    React.useState(pluginsPreinstalled);

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
  const theme = useTheme();
  const themeRef = React.useRef(theme.theme)
  themeRef.current = theme.theme;

  const [pendingPlugins, setPendingPlugins] = React.useState<
    PluginInfo[] | null
  >(null);

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        networkRequest: async (input: string, init?: RequestInit) => {
          if (hasExtension() && window.InfoGata?.networkRequest) {
            return await window.InfoGata.networkRequest(input, init);
          }

          const response = await fetch(input, init);

          const body = await response.blob();

          const responseHeaders = Object.fromEntries(
            response.headers.entries()
          );

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
        isLoggedIn: async () => {
          if (plugin.manifest?.authentication && plugin.id) {
            const pluginAuth = await db.pluginAuths.get(plugin.id);
            return !!pluginAuth;
          }
          return false;
        },
        getTheme: async () => {
          return themeRef.current;
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
          let toaster = toast.message;
          switch (notification.type) {
            case "error":
              toaster = toast.error;
              break;
            case "success":
              toaster = toast.success;
              break;
            case "info":
              toaster = toast.info;
              break;
            case "warning":
              toaster = toast.warning;
              break;
          }
          toaster(notification.message);
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

      const srcUrl = getPluginUrl(plugin.id || "", "/pluginframe.html");

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
        frameSrc: srcUrl,
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
    [dispatch]
  );

  const loadPlugins = React.useCallback(async () => {
    setPluginsFailed(false);
    try {
      const plugs = await db.plugins.toArray();

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      setPluginFrames(frames);
    } catch {
      toast.error(t("failedPlugins"));
      setPluginsFailed(true);
    } finally {
      setPluginsLoaded(true);
    }
  }, [loadPlugin, t]);

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
      toast(t("pluginAlreadyInstalled", { id: plugin.id }));
      return;
    }

    await loadAndAddPlugin(plugin);
  };

  const loadAndAddPlugin = React.useCallback(
    async (plugin: PluginInfo) => {
      const pluginFrame = await loadPlugin(plugin);
      setPluginFrames((prev) => [...prev, pluginFrame]);
      await db.plugins.put(plugin);
      if (!lyricsPluginId && (await pluginFrame.hasDefined.onGetLyrics())) {
        dispatch(setLyricsPluginId(pluginFrame.id));
      }
    },
    [dispatch, loadPlugin, lyricsPluginId]
  );

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
    const preinstall = async () => {
      if (pluginsLoaded && !pluginsPreinstalled) {
        try {
          // Make sure preinstall plugins aren't already installed
          const presinstallPlugins = defaultPlugins.filter(
            (dp) => !!dp.preinstall
          );
          const plugs = await db.plugins.toArray();
          const newPlugins = presinstallPlugins.filter(
            (preinstall) => !plugs.some((pf) => pf.id === preinstall.id)
          );
          await mapAsync(newPlugins, async (newPlugin) => {
            const fileType = getFileTypeFromPluginUrl(newPlugin.url);
            const plugin = await getPlugin(fileType, true);
            if (!plugin) return;

            await loadAndAddPlugin(plugin);
          });
          dispatch(setPluginsPreInstalled());
        } finally {
          setPreinstallComplete(true);
        }
      }
    };

    preinstall();
  }, [dispatch, pluginsLoaded, pluginsPreinstalled, loadAndAddPlugin]);

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
            const manifestText = await getFileText(
              fileType,
              "manifest.json",
              true
            );
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
    preinstallComplete: preinstallComplete ?? false,
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
