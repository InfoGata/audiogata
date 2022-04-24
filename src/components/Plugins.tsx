import React from "react";
import { Button, Grid, styled, TextField, Typography } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { FileType } from "../models";
import { usePlugins } from "../PluginsContext";
import PluginContainer from "./PluginContainer";
import { directoryProps, getPlugin } from "../utils";

const FileInput = styled("input")({
  display: "none",
});

const Plugins: React.FC = () => {
  const { plugins, addPlugin, deletePlugin } = usePlugins();
  const [pluginUrl, setPluginUrl] = React.useState("");
  const [headerKey, setHeaderKey] = React.useState("");
  const [headerValue, setHeaderValue] = React.useState("");

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileType: FileType = {
      filelist: files,
    };
    const plugin = await getPlugin(fileType);

    if (plugin) {
      plugin.id = nanoid();
      await addPlugin(plugin);
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
      await addPlugin(plugin);
    }
  };

  const pluginComponents = plugins.map((plugin) => (
    <PluginContainer
      key={plugin.id}
      plugin={plugin}
      deletePlugin={deletePlugin}
    />
  ));

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
      <Typography></Typography>
      <Grid>{pluginComponents}</Grid>
    </Grid>
  );
};

export default Plugins;
