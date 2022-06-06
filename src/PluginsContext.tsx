import React from "react";
import {
  Album,
  Artist,
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
} from "./plugintypes";
import {
  PluginFrame,
  PluginInterface as PluginFrameInterface,
} from "plugin-frame";
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

interface PluginInterface extends PlayerComponent {
  searchAll: (request: SearchRequest) => Promise<SearchAllResult>;
  searchTracks: (request: SearchRequest) => Promise<SearchTrackResult>;
  searchArtists: (request: SearchRequest) => Promise<SearchArtistResult>;
  searchAlbums: (request: SearchRequest) => Promise<SearchAlbumResult>;
  searchPlaylists: (request: SearchRequest) => Promise<SearchPlaylistResult>;
  onNowPlayingTracksAdded: (tracks: Track[]) => Promise<void>;
  onNowPlayingTracksRemoved: (tracks: Track[]) => Promise<void>;
  onNowPlayingTracksChanged: (tracks: Track[]) => Promise<void>;
  onNowPlayingTracksSet: (tracks: Track[]) => Promise<void>;
  getTrackUrl: (track: Track) => Promise<string>;
  onUiMessage: (message: any) => Promise<void>;
  onDeepLinkMessage: (message: string) => Promise<void>;
  getAlbumTracks: (album: Album) => Promise<Track[]>;
  getPlaylistTracks: (
    request: PlaylistTrackRequest
  ) => Promise<SearchTrackResult>;
  getArtistAlbums: (artist: Artist) => Promise<Album[]>;
  play: (track: Track) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  getUserPlaylists: (
    request: UserPlaylistRequest
  ) => Promise<SearchPlaylistResult>;
}

interface ApplicationPluginInterface extends PluginFrameInterface {
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
  getCorsProxy: () => Promise<string>;
  installPlugins: (plugins: PluginInfo[]) => Promise<void>;
  getPlugins: () => Promise<PluginInfo[]>;
  getPluginId: () => Promise<string>;
}

interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginInterface> {
  name?: string;
  id?: string;
  hasOptions?: boolean;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
  version?: string;
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

export const PluginsProvider: React.FC = (props) => {
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();
  const dispatch = useAppDispatch();
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const tracks = useAppSelector((state) => state.track.tracks);
  const { enqueueSnackbar } = useSnackbar();
  const [pendingPlugins, setPendingPlugins] = React.useState<
    PluginInfo[] | null
  >(null);

  const loadPlugin = (plugin: PluginInfo, pluginFiles?: FileList) => {
    const api: ApplicationPluginInterface = {
      networkRequest: async (input: RequestInfo, init?: RequestInit) => {
        const hasExtension = typeof window.MediaGata !== "undefined";
        if (hasExtension) {
          return await window.MediaGata.networkRequest(input, init);
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
          typeof window.MediaGata !== "undefined" ||
          isElectron() ||
          Capacitor.isNativePlatform();
        return isDisabled;
      },
      postUiMessage: async (message: any) => {
        setPluginMessage({ pluginId: plugin.id, message });
      },
      endTrack: async () => {
        if (currentTrack?.pluginId === plugin.id) {
          dispatch(nextTrack());
        }
      },
      setTrackTime: async (currentTime: number) => {
        if (currentTrack?.pluginId === plugin.id) {
          dispatch(setElapsed(currentTime));
        }
      },
      getNowPlayingTracks: async () => {
        return tracks;
      },
      setNowPlayingTracks: async (tracks: Track[]) => {
        dispatch(setTracks(tracks));
      },
      createNotification: async (notification: NotificationMessage) => {
        enqueueSnackbar(notification.message, { variant: notification.type });
      },
      getCorsProxy: async () => {
        return "http://localhost:8085";
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
    if (process.env.NODE_ENV === "production" || Capacitor.isNativePlatform()) {
      srcUrl = `https://${plugin.id}.audiogata.com/pluginframe.html`;
    }

    const completeMethods = {
      searchAll: (result: SearchAllResult) => {
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
      searchTracks: (result: SearchTrackResult) => {
        result.items.forEach((i) => {
          i.pluginId = plugin.id;
        });
        return result;
      },
      searchArtists: (result: SearchArtistResult) => {
        result.items.forEach((i) => {
          i.pluginId = plugin.id;
        });
        return result;
      },
      searchAlbums: (result: SearchAlbumResult) => {
        result.items.forEach((i) => {
          i.pluginId = plugin.id;
        });
        return result;
      },
      searchPlaylists: (result: SearchPlaylistResult) => {
        result.items.forEach((i) => {
          i.pluginId = plugin.id;
        });
        return result;
      },
      getPlaylistTracks: (result: SearchTrackResult) => {
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
    });
    host.id = plugin.id;
    host.optionsSameOrigin = plugin.optionsSameOrigin;
    host.name = plugin.name;
    host.version = plugin.version;
    host.hasOptions = !!plugin.optionsHtml;
    host.fileList = pluginFiles;
    host.ready().then(async () => {
      await host.executeCode(plugin.script);
    });
    return host;
  };

  React.useEffect(() => {
    const getPlugins = async () => {
      const plugs = await db.plugins.toArray();
      const frames = plugs.map((p) => loadPlugin(p));
      setPluginFrames(frames);
    };
    getPlugins();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
      console.log(event.url);
      if (event.url.startsWith("com.audiogata.app://message")) {
        const url = new URL(event.url);
        const pluginId = url.searchParams.get("pluginId");
        console.log("pluginId:", pluginId);
        console.log("plugins:", pluginFrames);
        const plugin = pluginFrames.find((p) => p.id === pluginId);
        console.log("plugin:", plugin);
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
    const pluginFrame = loadPlugin(plugin);
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
    const pluginFrame = loadPlugin(plugin, pluginFiles);
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
