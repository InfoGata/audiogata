import React from "react";
import {
  Playlist,
  Track,
  NotificationMessage,
  PlaylistTrackRequest,
  PluginInfo,
  SearchAlbumResult,
  SearchAllResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchRequest,
  SearchTrackResult,
  UserPlaylistRequest,
  PlaylistTracksResult,
  ArtistAlbumsResult,
  AlbumTracksResult,
  AlbumTrackRequest,
  ArtistAlbumRequest,
  GetTrackUrlRequest,
  PlayTrackRequest,
} from "./plugintypes";
import { PluginFrame, PluginInterface } from "plugin-frame";
import { db } from "./database";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  nextTrack,
  setElapsed,
  setTracks,
} from "./store/reducers/trackReducer";
import { useSnackbar } from "notistack";
import { isElectron } from "./utils";
import { Capacitor } from "@capacitor/core";
import ConfirmPluginDialog from "./components/ConfirmPluginDialog";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { addPlaylists } from "./store/reducers/playlistReducer";
import { NetworkRequest, PlayerComponent } from "./types";
import { nanoid } from "@reduxjs/toolkit";

export interface PluginMethodInterface extends PlayerComponent {
  onSearchAll: (request: SearchRequest) => Promise<SearchAllResult>;
  onSearchTracks: (request: SearchRequest) => Promise<SearchTrackResult>;
  onSearchArtists: (request: SearchRequest) => Promise<SearchArtistResult>;
  onSearchAlbums: (request: SearchRequest) => Promise<SearchAlbumResult>;
  onSearchPlaylists: (request: SearchRequest) => Promise<SearchPlaylistResult>;
  onNowPlayingTracksAdded: (tracks: Track[]) => Promise<void>;
  onNowPlayingTracksRemoved: (tracks: Track[]) => Promise<void>;
  onNowPlayingTracksChanged: (tracks: Track[]) => Promise<void>;
  onNowPlayingTracksSet: (tracks: Track[]) => Promise<void>;
  onGetTrackUrl: (request: GetTrackUrlRequest) => Promise<string>;
  onUiMessage: (message: any) => Promise<void>;
  onDeepLinkMessage: (message: string) => Promise<void>;
  onGetAlbumTracks: (request: AlbumTrackRequest) => Promise<AlbumTracksResult>;
  onGetPlaylistTracks: (
    request: PlaylistTrackRequest
  ) => Promise<PlaylistTracksResult>;
  onGetArtistAlbums: (
    request: ArtistAlbumRequest
  ) => Promise<ArtistAlbumsResult>;
  onPlay: (request: PlayTrackRequest) => Promise<void>;
  onSetVolume: (volume: number) => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
  onSeek: (time: number) => Promise<void>;
  onSetPlaybackRate: (rate: number) => Promise<void>;
  onGetUserPlaylists: (
    request: UserPlaylistRequest
  ) => Promise<SearchPlaylistResult>;
  onGetTopItems: () => Promise<SearchAllResult>;
}

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<NetworkRequest>;
  postUiMessage: (message: any) => Promise<void>;
  isNetworkRequestCorsDisabled: () => Promise<boolean>;
  endTrack: () => Promise<void>;
  setTrackTime: (currentTime: number) => Promise<void>;
  getNowPlayingTracks: () => Promise<Track[]>;
  setNowPlayingTracks: (tracks: Track[]) => Promise<void>;
  getPlaylists: () => Promise<Playlist[]>;
  addPlaylists: (playlists: Playlist[]) => Promise<void>;
  createNotification: (notification: NotificationMessage) => Promise<void>;
  getCorsProxy: () => Promise<string | undefined>;
  installPlugins: (plugins: PluginInfo[]) => Promise<void>;
  getPlugins: () => Promise<PluginInfo[]>;
  getPluginId: () => Promise<string>;
}

interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginMethodInterface> {
  name?: string;
  id?: string;
  hasOptions?: boolean;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
  version?: string;
  manifestUrl?: string;
}

export interface PluginContextInterface {
  addPlugin: (plugin: PluginInfo, pluginFiles?: FileList) => Promise<void>;
  updatePlugin: (
    plugin: PluginInfo,
    id: string,
    pluginFiles?: FileList
  ) => Promise<void>;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
  plugins: PluginFrameContainer[];
  pluginMessage?: PluginMessage;
  pluginsLoaded: boolean;
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);

let globalPluginFrames: PluginFrameContainer[] = [];
export const getPluginFrames = () => globalPluginFrames;

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

export const PluginsProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [pluginsLoaded, setPluginsLoaded] = React.useState(false);
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();
  const dispatch = useAppDispatch();

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

  const { enqueueSnackbar } = useSnackbar();
  const [pendingPlugins, setPendingPlugins] = React.useState<
    PluginInfo[] | null
  >(null);

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        networkRequest: async (input: RequestInfo, init?: RequestInit) => {
          const hasExtension = typeof window.InfoGata !== "undefined";
          if (hasExtension) {
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
            typeof window.InfoGata !== "undefined" ||
            isElectron() ||
            Capacitor.isNativePlatform();
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
          if (
            process.env.NODE_ENV === "production" ||
            corsProxyUrlRef.current
          ) {
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
        addPlaylists: async (playlists: Playlist[]) => {
          dispatch(addPlaylists(playlists));
        },
      };

      let srcUrl = `${window.location.protocol}//${plugin.id}.${window.location.host}/pluginframe.html`;
      if (
        process.env.NODE_ENV === "production" ||
        Capacitor.isNativePlatform()
      ) {
        srcUrl = `https://${plugin.id}.audiogata.com/pluginframe.html`;
      }

      const completeMethods: { [key in keyof PluginMethodInterface]?: any } = {
        onSearchAll: (result: SearchAllResult) => {
          result.tracks?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          result.albums?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          result.artists?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          result.playlists?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchTracks: (result: SearchTrackResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchArtists: (result: SearchArtistResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchAlbums: (result: SearchAlbumResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchPlaylists: (result: SearchPlaylistResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetPlaylistTracks: (result: SearchTrackResult) => {
          result.items.forEach((i) => {
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
          });
          result.artists?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          result.playlists?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetUserPlaylists: (result: SearchPlaylistResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetAlbumTracks: (result: AlbumTracksResult) => {
          if (result.album) {
            result.album.pluginId = plugin.id;
          }
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetArtistAlbums: (result: ArtistAlbumsResult) => {
          if (result.artist) {
            result.artist.pluginId = plugin.id;
          }
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
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
      await host.ready();
      await host.executeCode(plugin.script);
      return host;
    },
    [dispatch, enqueueSnackbar]
  );

  React.useEffect(() => {
    const getPlugins = async () => {
      try {
        const plugs = await db.plugins.toArray();

        const framePromises = plugs.map((p) => loadPlugin(p));
        const frames = await Promise.all(framePromises);
        setPluginFrames(frames);
      } finally {
        setPluginsLoaded(true);
      }
    };
    getPlugins();
  }, [loadPlugin]);

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
    globalPluginFrames = pluginFrames;
  }, [pluginFrames]);

  const addPlugin = async (plugin: PluginInfo) => {
    const pluginFrame = await loadPlugin(plugin);
    setPluginFrames([...pluginFrames, pluginFrame]);
    await db.plugins.add(plugin);
  };

  const updatePlugin = async (
    plugin: PluginInfo,
    id: string,
    pluginFiles?: FileList
  ) => {
    const oldPlugin = pluginFrames.find((p) => p.id === id);
    oldPlugin?.destroy();
    const pluginFrame = await loadPlugin(plugin, pluginFiles);
    setPluginFrames(pluginFrames.map((p) => (p.id === id ? pluginFrame : p)));
    await db.plugins.update(id, plugin);
  };

  const deletePlugin = async (pluginFrame: PluginFrameContainer) => {
    const newPlugins = pluginFrames.filter((p) => p.id !== pluginFrame.id);
    setPluginFrames(newPlugins);
    await db.plugins.delete(pluginFrame.id || "");
  };

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    plugins: pluginFrames,
    pluginMessage: pluginMessage,
    pluginsLoaded,
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

export const usePlugins = () => React.useContext(PluginsContext);

export default PluginsContext;
