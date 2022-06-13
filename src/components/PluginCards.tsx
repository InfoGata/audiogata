import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CardActions,
  Button,
} from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { usePlugins } from "../PluginsContext";
import { getFileTypeFromPluginUrl, getPlugin } from "../utils";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";

interface PluginDescription {
  name: string;
  url: string;
  description: string;
}

const pluginDescriptions: PluginDescription[] = [
  {
    name: "Plugin for Youtube",
    description: "Plugin for playing music from youtube.com",
    url: "https://gitlab.com/api/v4/projects/26680847/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Napster",
    description: "Play music from napster. Requires napster login.",
    url: "https://gitlab.com/api/v4/projects/35720504/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Spotify",
    description: "Play music from Spotify. Requires Spotify login.",
    url: "https://gitlab.com/api/v4/projects/35723151/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://gitlab.com/api/v4/projects/35748829/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Dropbox",
    description: "Store and retreive playlists from Dropbox",
    url: "https://gitlab.com/api/v4/projects/35751390/repository/files/manifest.json/raw?ref=master",
  },
];

const PluginCards: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { plugins, addPlugin } = usePlugins();
  const navigate = useNavigate();

  const onAddPlugin = async (description: PluginDescription) => {
    const fileType = getFileTypeFromPluginUrl(description.url);

    const plugin = await getPlugin(fileType);

    if (plugin) {
      if (!plugin.id) {
        plugin.id = nanoid();
      }
      plugin.manifestUrl = description.url;
      await addPlugin(plugin);
      enqueueSnackbar(`Successfully added plugin: ${plugin.name}`);
      navigate("/plugins");
    }
  };

  const pluginCards = pluginDescriptions
    .filter((pd) => !plugins.some((p) => pd.name === p.name))
    .map((p, i) => (
      <Grid item xs={4} key={i}>
        <Card>
          <CardContent>
            <Typography>{p.name}</Typography>
            <Typography color="text.secondary">{p.description}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => onAddPlugin(p)}>
              Add
            </Button>
          </CardActions>
        </Card>
      </Grid>
    ));

  return (
    <>
      <Typography variant="h6">Plugins</Typography>
      <Grid container spacing={2}>
        {pluginCards}
      </Grid>
    </>
  );
};

export default PluginCards;
