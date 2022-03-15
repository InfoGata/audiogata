import React from "react";
import { IAlbum, IArtist, IPlaylist, ISong, PluginInfo } from "./models";
import { PluginFrame } from "plugin-frame";
import { db } from "./database";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { nextTrack, setElapsed } from "./store/reducers/songReducer";

interface PluginInterface {
  searchAll: (query: string) => Promise<{
    tracks?: ISong[];
    albums?: IAlbum[];
    artists?: IArtist[];
    playlists?: IPlaylist[];
  }>;
  getTrackUrl: (song: ISong) => Promise<string>;
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

interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginInterface> {
  name?: string;
  id?: string;
  hasOptions = false;
}

interface NetworkRequest {
  body: Blob;
  headers: { [k: string]: string };
  status: number;
  statusText: string;
  url: string;
}

interface MediaGataExtension {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<NetworkRequest>;
}

declare global {
  interface Window {
    MediaGata: MediaGataExtension;
  }
}

export interface PluginContextInterface {
  addPlugin: (plugin: PluginInfo) => Promise<void>;
  updatePlugin: (plugin: PluginInfo, id: string) => Promise<void>;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
  plugins: PluginFrameContainer[];
  pluginMessage?: PluginMessage;
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);

export const PluginsProvider: React.FC = (props) => {
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();
  const dispatch = useAppDispatch();
  const currentSong = useAppSelector((state) => state.song.currentSong);

  const loadPlugin = (plugin: PluginInfo) => {
    const api = {
      networkRequest: async (input: RequestInfo, init?: RequestInit) => {
        const hasExtension = typeof window.MediaGata !== "undefined";
        if (hasExtension) {
          return await window.MediaGata.networkRequest(input, init);
        }
        const response = await fetch(input, init);
        const body = await response.blob();
        const responseHeaders = Object.fromEntries(response.headers.entries());
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
        const hasExtension = typeof window.MediaGata !== "undefined";
        return hasExtension;
      },
      postUiMessage: async (message: any) => {
        setPluginMessage({ pluginId: plugin.id, message });
      },
      endTrack: async () => {
        if (currentSong?.id === plugin.id) {
          dispatch(nextTrack());
        }
      },
      setTrackTime: async (currentTime: number) => {
        if (currentSong?.id === plugin.id) {
          dispatch(setElapsed(currentTime));
        }
      },
    };

    let srcUrl = `http://${plugin.id}.${window.location.host}/audiogata/pluginframe.html`;
    if (process.env.NODE_ENV === "production") {
      srcUrl = `https://${plugin.id}.audiogata.com/pluginframe.html`;
    }

    const host = new PluginFrameContainer(api, {
      frameSrc: new URL(srcUrl),
      sandboxAttributes: ["allow-scripts", "allow-same-origin"],
    });
    host.id = plugin.id;
    host.name = plugin.name;
    host.hasOptions = !!plugin.optionsHtml;
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

  const addPlugin = async (plugin: PluginInfo) => {
    const pluginFrame = loadPlugin(plugin);
    setPluginFrames([...pluginFrames, pluginFrame]);
    await db.plugins.add(plugin);
  };

  const updatePlugin = async (plugin: PluginInfo, id: string) => {
    const oldPlugin = pluginFrames.find((p) => p.id === id);
    oldPlugin?.destroy();
    const pluginFrame = loadPlugin(plugin);
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