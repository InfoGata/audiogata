import { Button, Grid, Typography, styled } from "@mui/material";
import React from "react";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import { db } from "../database";
import { directoryProps, getPlugin } from "../utils";
import { FileType } from "../models";
import { Capacitor } from "@capacitor/core";

const FileInput = styled("input")({
  display: "none",
});

interface PluginContainerProps {
  plugin: PluginFrameContainer;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
}

const PluginContainer: React.FC<PluginContainerProps> = (props) => {
  const { plugin, deletePlugin } = props;
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const { pluginMessage, updatePlugin } = usePlugins();
  const [optionsHtml, setOptionsHtml] = React.useState<string>();
  const ref = React.useRef<HTMLIFrameElement>(null);

  const iframeListener = React.useCallback(
    async (event: MessageEvent<any>) => {
      if (ref.current?.contentWindow === event.source) {
        if (await plugin.hasDefined.onUiMessage()) {
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
    setOptionsOpen(true);
    if (!plugin.optionsSameOrigin) {
      const pluginData = await db.plugins.get(plugin.id || "");
      setOptionsHtml(pluginData?.optionsHtml);
    }
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

  const updatePluginFromFilelist = async (files: FileList) => {
    const fileType: FileType = {
      filelist: files,
    };
    const newPlugin = await getPlugin(fileType);

    if (newPlugin && plugin.id) {
      newPlugin.id = plugin.id;
      await updatePlugin(newPlugin, plugin.id, files);
      setOptionsOpen(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    await updatePluginFromFilelist(files);
  };

  const onReload = async () => {
    const files = plugin.fileList;
    if (!files) return;

    await updatePluginFromFilelist(files);
  };

  const iframeOnload = async () => {
    const pluginData = await db.plugins.get(plugin.id || "");
    if (pluginData) {
      ref.current?.contentWindow?.postMessage(
        {
          type: "init",
          srcdoc: pluginData?.optionsHtml,
        },
        "*"
      );
    }
  };

  let srcUrl = `${window.location.protocol}//${plugin.id}.${window.location.host}/ui.html`;
  if (process.env.NODE_ENV === "production" || Capacitor.isNativePlatform()) {
    srcUrl = `https://${plugin.id}.audiogata.com/ui.html`;
  }
  let sandbox = "allow-scripts allow-popups allow-popups-to-escape-sandbox";
  if (plugin.optionsSameOrigin) sandbox = sandbox.concat(" allow-same-origin");
  // window.open needs allow-top-navigation-by-user-activiation
  if (Capacitor.isNativePlatform())
    sandbox = sandbox.concat(" allow-top-navigation-by-user-activation");

  const pluginIframe = plugin.optionsSameOrigin ? (
    <iframe
      ref={ref}
      name={plugin.id}
      title={plugin.name}
      sandbox={sandbox}
      src={srcUrl}
      onLoad={iframeOnload}
      style={{ backgroundColor: "white" }}
    />
  ) : (
    <iframe
      ref={ref}
      name={plugin.id}
      title={plugin.name}
      sandbox={sandbox}
      srcDoc={optionsHtml}
      style={{ backgroundColor: "white" }}
    />
  );
  return (
    <Grid key={plugin.id}>
      <Typography>
        {plugin.name} {plugin.version}
      </Typography>
      {plugin.hasOptions && !optionsOpen && (
        <Button onClick={onOpenOptions}>Open Options</Button>
      )}
      {optionsOpen && <Button onClick={onCloseOptions}>Close Options</Button>}
      <Button onClick={onDelete}>Delete</Button>
      <label htmlFor={`update-plugin-${plugin.id}`}>
        <FileInput
          id={`update-plugin-${plugin.id}`}
          type="file"
          {...directoryProps}
          onChange={onFileChange}
        />
        <Button component="span">Update From File</Button>
      </label>
      {plugin.fileList && <Button onClick={onReload}>Reload</Button>}
      <Grid>{optionsOpen && pluginIframe}</Grid>
    </Grid>
  );
};

export default PluginContainer;
