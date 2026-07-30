import React from "react";
import { PluginFrameContainer } from "../contexts/PluginsContext";
import { defaultPluginAliasMap, defaultPluginMap } from "../default-plugins";
import { PluginInfo } from "../plugintypes";
import { getFileTypeFromPluginUrl, getPlugin } from "../utils";

interface FindPluginArgs {
  pluginsLoaded: boolean;
  pluginId: string | undefined;
  plugin: PluginFrameContainer | undefined;
}

const useFindPlugin = (args: FindPluginArgs) => {
  const { pluginsLoaded, pluginId, plugin } = args;
  const [isLoading, setIsloading] = React.useState(false);
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );

  React.useEffect(() => {
    const findPlugin = async () => {
      if (pluginsLoaded && !plugin && pluginId) {
        // For a plugin that isn't installed there's no alias to resolve
        // against, so the url segment arrives here unchanged — which means it
        // may be either an id (old links) or an alias (current ones).
        const newPlugin =
          defaultPluginMap.get(pluginId) ?? defaultPluginAliasMap.get(pluginId);
        if (newPlugin) {
          setIsloading(true);
          const fileType = getFileTypeFromPluginUrl(newPlugin.url);

          const plugin = await getPlugin(fileType);
          if (plugin) {
            plugin.manifestUrl = newPlugin.url;
            setPendingPlugin(plugin);
          }
          setIsloading(false);
        }
      }
    };

    findPlugin();
  }, [pluginsLoaded, pluginId, plugin]);

  const removePendingPlugin = () => {
    setPendingPlugin(null);
  };

  return { isLoading, pendingPlugin, removePendingPlugin };
};

export default useFindPlugin;
