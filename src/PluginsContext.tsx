import React from "react";
import {
  IAlbum,
  IArtist,
  IPlaylist,
  ISong,
  NetworkRequest,
  NotificationMessage,
  PluginInfo,
} from "./models";
import {
  PluginFrame,
  PluginInterface as PluginFrameInterface,
} from "plugin-frame";
import { db } from "./database";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { nextTrack, setElapsed, setTracks } from "./store/reducers/songReducer";
import { useSnackbar } from "notistack";
import { IPlayerComponent } from "./plugins/IPlayerComponent";
import { isElectron } from "./utils";
import { Capacitor } from "@capacitor/core";

interface PluginInterface extends IPlayerComponent {
  searchAll: (query: string) => Promise<{
    tracks?: ISong[];
    albums?: IAlbum[];
    artists?: IArtist[];
    playlists?: IPlaylist[];
  }>;
  onNowPlayingTracksAdded: (track: ISong[]) => Promise<void>;
  onNowPlayingTracksRemoved: (track: ISong[]) => Promise<void>;
  onNowPlayingTracksChanged: (track: ISong[]) => Promise<void>;
  onNowPlayingTracksSet: (track: ISong[]) => Promise<void>;
  getTrackUrl: (track: ISong) => Promise<string>;
  onUiMessage: (message: any) => Promise<void>;
  getAlbumTracks: (album: IAlbum) => Promise<ISong[]>;
  getPlaylistTracks: (playlist: IPlaylist) => Promise<ISong[]>;
  getArtistAlbums: (artist: IArtist) => Promise<IAlbum[]>;
  play: (song: ISong) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
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
  getNowPlayingTracks: () => Promise<ISong[]>;
  setNowPlayingTracks: (tracks: ISong[]) => Promise<void>;
  createNotification: (notification: NotificationMessage) => Promise<void>;
}

interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginInterface> {
  name?: string;
  id?: string;
  hasOptions = false;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
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
  const currentSong = useAppSelector((state) => state.song.currentSong);
  const tracks = useAppSelector((state) => state.song.songs);
  const { enqueueSnackbar } = useSnackbar();

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
        if (currentSong?.from === plugin.id) {
          dispatch(nextTrack());
        }
      },
      setTrackTime: async (currentTime: number) => {
        if (currentSong?.from === plugin.id) {
          dispatch(setElapsed(currentTime));
        }
      },
      getNowPlayingTracks: async () => {
        return tracks;
      },
      setNowPlayingTracks: async (tracks: ISong[]) => {
        dispatch(setTracks(tracks));
      },
      createNotification: async (notification: NotificationMessage) => {
        enqueueSnackbar(notification.message, { variant: notification.type });
      },
    };

    let srcUrl = `${window.location.protocol}//${plugin.id}.${window.location.host}/pluginframe.html`;
    if (process.env.NODE_ENV === "production" || Capacitor.isNativePlatform()) {
      srcUrl = `https://${plugin.id}.audiogata.com/pluginframe.html`;
    }

    const host = new PluginFrameContainer(api, {
      frameSrc: new URL(srcUrl),
      sandboxAttributes: ["allow-scripts", "allow-same-origin"],
    });
    host.id = plugin.id;
    host.optionsSameOrigin = plugin.optionsSameOrigin;
    host.name = plugin.name;
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
  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);

export default PluginsContext;
