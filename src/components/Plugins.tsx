import React from "react";
import { Button, Divider, Grid, styled } from "@mui/material";
import Spotify from "../plugins/spotify";
import { nanoid } from "@reduxjs/toolkit";
import { FileType } from "../models";
import { usePlugins } from "../PluginsContext";
import PluginContainer from "./PluginContainer";
import { directoryProps, getPlugin } from "../utils";

const Input = styled("input")({
  display: "none",
});

const Plugins: React.FC = () => {
  const { plugins, addPlugin, deletePlugin } = usePlugins();

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

  const onSpotifyLoginClick = async () => {
    await Spotify.login();
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
      <label htmlFor="contained-button-file">
        <Input
          id="contained-button-file"
          type="file"
          {...directoryProps}
          onChange={onFileChange}
        />
        <Button variant="contained" component="span">
          Load plugin From Folder
        </Button>
      </label>
      <Divider />
      {pluginComponents}
      <Button onClick={onSpotifyLoginClick}>Login to Spotify</Button>
    </Grid>
  );
};

export default Plugins;
