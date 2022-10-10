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
import { defaultPlugins, PluginDescription } from "../default-plugins";

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

  const pluginCards = defaultPlugins
    .filter((dp) => !plugins.some((p) => dp.id === p.id))
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
      {pluginCards.length > 0 && (
        <Grid>
          <Backdrop open={backdropOpen}>
            <CircularProgress color="inherit" />
          </Backdrop>
          <Typography variant="h6">Plugins</Typography>
          <Fade in={pluginsLoaded}>
            <Grid container spacing={2}>
              {pluginCards}
            </Grid>
          </Fade>
        </Grid>
      )}
    </>
  );
};

export default PluginCards;
