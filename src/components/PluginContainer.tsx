import { Button, Grid, IconButton, Typography } from "@mui/material";
import React, { useRef } from "react";
import { PluginFrame, usePlugins } from "../PluginsContext";
import { Delete } from "@mui/icons-material";
import { db } from "../database";

interface PluginContainerProps {
  plugin: PluginFrame;
  deletePlugin: (plugin: PluginFrame) => Promise<void>;
}

const PluginContainer: React.FC<PluginContainerProps> = (props) => {
  const { plugin, deletePlugin } = props;
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const { pluginMessage } = usePlugins();
  const [optionsHtml, setOptionsHtml] = React.useState<string>();
  const ref = useRef<HTMLIFrameElement>(null);

  const iframeListener = React.useCallback(
    async (event: MessageEvent<any>) => {
      if (
        event.origin === "null" &&
        ref.current?.contentWindow === event.source
      ) {
        if (await plugin.methodDefined("onUiMessage")) {
          plugin.remote.onUiMessage(event.data);
        }
      }
    },
    [plugin]
  );

  React.useEffect(() => {
    window.addEventListener("message", iframeListener);
    return () => window.removeEventListener("message", iframeListener);
  }, [iframeListener]);

  React.useEffect(() => {
    if (pluginMessage?.pluginId === plugin.id) {
      ref.current?.contentWindow?.postMessage(pluginMessage?.message, "*");
    }
  }, [pluginMessage, plugin.id]);

  const onOpenOptions = async () => {
    const pluginData = await db.plugins.get(plugin.id || "");
    setOptionsHtml(pluginData?.optionsHtml);
    setOptionsOpen(true);
  };

  const onCloseOptions = () => {
    setOptionsOpen(false);
  };

  const onDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this plugin"
    );
    if (confirmDelete) {
      await deletePlugin(plugin);
    }
  };

  const pluginIframe = (
    <iframe
      ref={ref}
      name={plugin.id}
      title={PluginFrame.name}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      srcDoc={optionsHtml}
    />
  );
  return (
    <Grid key={plugin.id}>
      <Typography>{plugin.name}</Typography>
      {plugin.hasOptions && !optionsOpen && (
        <Button onClick={onOpenOptions}>Open Options</Button>
      )}
      {optionsOpen && <Button onClick={onCloseOptions}>Close Options</Button>}
      <IconButton onClick={onDelete}>
        <Delete />
      </IconButton>
      {optionsOpen && pluginIframe}
    </Grid>
  );
};

export default PluginContainer;
