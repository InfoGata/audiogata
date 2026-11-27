import React from "react";
import usePlugins from "./usePlugins";

/**
 * Forwards every message the plugin posts to its UI into `frame`, in order.
 */
const usePluginMessages = (
  pluginId: string | undefined,
  frame: React.RefObject<HTMLIFrameElement | null>
) => {
  const { subscribeToPluginMessages } = usePlugins();

  React.useEffect(() => {
    if (!pluginId) return;
    return subscribeToPluginMessages((pluginMessage) => {
      if (pluginMessage.pluginId === pluginId) {
        frame.current?.contentWindow?.postMessage(pluginMessage.message, "*");
      }
    });
  }, [subscribeToPluginMessages, pluginId, frame]);
};

export default usePluginMessages;
