import React from "react";
import { Button, Grid, styled, TextField } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { FileType } from "../types";
import { usePlugins } from "../PluginsContext";
import PluginContainer from "./PluginContainer";
import { directoryProps, getPlugin } from "../utils";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import { PluginInfo } from "../plugintypes";

const FileInput = styled("input")({
  display: "none",
});

const Plugins: React.FC = () => {
  const { plugins, deletePlugin } = usePlugins();
  const [pluginUrl, setPluginUrl] = React.useState("");
  const [headerKey, setHeaderKey] = React.useState("");
  const [headerValue, setHeaderValue] = React.useState("");
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileType: FileType = {
      filelist: files,
    };
    const plugin = await getPlugin(fileType);

    if (plugin) {
      plugin.id = nanoid();
      setPendingPlugin(plugin);
    }
  };

  const onChangePluginUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPluginUrl(event.target.value);
  };
  const onChangeHeaderKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderKey(event.target.value);
  };
  const onChangeHeaderValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderValue(event.target.value);
  };

  const onConfirmPluginClose = () => {
    setPendingPlugin(null);
  };

  const onLoadUrl = async () => {
    if (!pluginUrl.includes("manifest.json")) {
      alert("The filename 'manifest.json' must be in the url");
      return;
    }
    const headers = new Headers();
    if (headerKey) {
      headers.append(headerKey, headerValue);
    }

    const fileType: FileType = {
      url: {
        url: pluginUrl,
        headers: headers,
      },
    };

    const plugin = await getPlugin(fileType);

    if (plugin) {
      plugin.id = nanoid();
      setPendingPlugin(plugin);
    }
  };

  const pluginComponents = plugins.map((plugin) => (
    <PluginContainer
      key={plugin.id}
      plugin={plugin}
      deletePlugin={deletePlugin}
      isCheckingUpdate={isCheckingUpdate}
    />
  ));

  const onCheckUpdates = () => {
    setIsCheckingUpdate(true);
  };

  return (
    <Grid>
      <Grid>
        <label htmlFor="contained-button-file">
          <FileInput
            id="contained-button-file"
            type="file"
            {...directoryProps}
            onChange={onFileChange}
          />
          <Button variant="contained" component="span">
            Load plugin From Folder
          </Button>
        </label>
      </Grid>
      <Grid>
        <TextField
          onChange={onChangePluginUrl}
          value={pluginUrl}
          placeholder="manifest.json url"
          variant="outlined"
        />
        <TextField
          onChange={onChangeHeaderKey}
          value={headerKey}
          placeholder="Header key"
          variant="outlined"
        />
        <TextField
          onChange={onChangeHeaderValue}
          value={headerValue}
          placeholder="Header Value"
          variant="outlined"
        />
        <Button onClick={onLoadUrl}>Load Url</Button>
      </Grid>
      <Grid>
        <Button disabled={isCheckingUpdate} onClick={onCheckUpdates}>
          Check For Updates
        </Button>
      </Grid>
      <Grid>{pluginComponents}</Grid>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={onConfirmPluginClose}
      />
    </Grid>
  );
};

export default Plugins;
