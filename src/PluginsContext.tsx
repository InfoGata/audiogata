import React from "react";
import { PluginInfo } from "./models";
import { PluginHost } from "plugin-frame";
import { db } from "./database";

export class PluginFrame extends PluginHost {
  name?: string;
  id?: string;
}

export interface PluginContextInterface {
  addPlugin: (plugin: PluginInfo) => Promise<void>;
  deletePlugin: (plugin: PluginFrame) => Promise<void>;
  plugins: PluginFrame[];
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);

const loadPlugin = (plugin: PluginInfo) => {
  const api = {
    networkRequest: async (input: RequestInfo, init?: RequestInit) => {
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
    //postUiMessage: async (message: any) => {
    //  const pluginUiframes = pluginOptionsRefs.current.filter(
    //    (i) => i.name === plugin.name
    //  );
    //  pluginUiframes.forEach((p) =>
    //    p.contentWindow?.postMessage(message, "*")
    //  );
    //},
  };
  //const srcUrl = `http://${plugin.id}.${window.location.host}/pluginframe.html`;
  const srcUrl = `http://${window.location.host}/audiogata/pluginframe.html`;
  const host = new PluginFrame(api, {
    frameSrc: new URL(srcUrl),
    sandboxAttributes: ["allow-scripts"],
  });
  host.id = plugin.id;
  host.name = plugin.name;
  host.ready().then(async () => {
    await host.executeCode(plugin.script);
  });
  return host;
};

const PluginsProvider: React.FC = (props) => {
  const [pluginFrames, setPluginFrames] = React.useState<PluginFrame[]>([]);
  React.useEffect(() => {
    const getPlugins = async () => {
      const plugs = await db.plugins.toArray();
      const frames = plugs.map((p) => loadPlugin(p));
      setPluginFrames(frames);
    };
    getPlugins();
  }, []);

  const addPlugin = async (plugin: PluginInfo) => {
    const pluginFrame = loadPlugin(plugin);
    setPluginFrames([...pluginFrames, pluginFrame]);
    await db.plugins.add(plugin);
  };

  const deletePlugin = async (pluginFrame: PluginFrame) => {
    const newPlugins = pluginFrames.filter((p) => p.id !== pluginFrame.id);
    setPluginFrames(newPlugins);
    await db.plugins.delete(pluginFrame.id || "");
  };

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    plugins: pluginFrames,
  };
  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export default PluginsContext;

export { PluginsProvider };
