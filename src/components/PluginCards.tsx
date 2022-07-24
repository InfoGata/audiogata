import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CardActions,
  Button,
  Backdrop,
  CircularProgress,
  Fade,
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
    name: "Plugin for SoundCloud",
    description: "Play music from SoundCloud.",
    url: "https://gitlab.com/api/v4/projects/38039113/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Spotify",
    description: "Play music from Spotify. Requires Spotify login.",
    url: "https://gitlab.com/api/v4/projects/35723151/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Napster",
    description: "Play music from napster. Requires napster login.",
    url: "https://gitlab.com/api/v4/projects/35720504/repository/files/manifest.json/raw?ref=master",
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
  const { plugins, addPlugin, pluginsLoaded } = usePlugins();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const navigate = useNavigate();

  const onAddPlugin = async (description: PluginDescription) => {
    setBackdropOpen(true);
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
    setBackdropOpen(false);
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
      <Backdrop open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h6">Plugins</Typography>
      <Fade in={pluginsLoaded}>
        <Grid container spacing={2}>
          {pluginCards}
        </Grid>
      </Fade>
    </>
  );
};

export default PluginCards;
