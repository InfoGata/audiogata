import { PluginFrameContainer, PluginMethodInterface } from "@/PluginsContext";
import usePlugins from "./usePlugins";
import React from "react";
import { useAppSelector } from "@/store/hooks";
import { filterAsync } from "@/utils";

const usePluginWithMethod = (methodName: keyof PluginMethodInterface) => {
  const { plugins } = usePlugins();
  const [plugin, setPlugin] = React.useState<PluginFrameContainer>();

  const currentPluginId = useAppSelector(
    (state) => state.settings.currentPluginId
  );
  React.useEffect(() => {
    const getSearchPlugin = async () => {
      const validPlugins = await filterAsync(plugins, (p) =>
        p.methodDefined(methodName)
      );
      const plugin = validPlugins.some((p) => p.id === currentPluginId)
        ? validPlugins.find((p) => p.id === currentPluginId)
        : validPlugins[0];
      setPlugin(plugin);
    };
    getSearchPlugin();
  }, [currentPluginId, plugins, methodName]);

  return plugin;
};

export default usePluginWithMethod;
