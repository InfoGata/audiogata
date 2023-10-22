import {
  Backdrop,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Fade,
  Grid,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PluginDescription, defaultPlugins } from "../default-plugins";
import usePlugins from "../hooks/usePlugins";
import {
  generatePluginId,
  getFileTypeFromPluginUrl,
  getPlugin,
} from "../utils";

const PluginCards: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { plugins, addPlugin, pluginsLoaded, preinstallComplete } =
    usePlugins();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const navigate = useNavigate();

  const onAddPlugin = async (description: PluginDescription) => {
    setBackdropOpen(true);
    const fileType = getFileTypeFromPluginUrl(description.url);

    const plugin = await getPlugin(fileType);

    if (plugin) {
      if (!plugin.id) {
        plugin.id = generatePluginId();
      }
      await addPlugin(plugin);
      enqueueSnackbar(`${t("addPluginSuccess")}: ${plugin.name}`);
      navigate("/plugins");
    }
    setBackdropOpen(false);
  };

  const pluginCards = defaultPlugins
    // Filter out already installed plugins
    // and preinstall plugins if preinstalling
    .filter(
      (dp) =>
        !plugins.some((p) => dp.id === p.id) &&
        (preinstallComplete || !dp.preinstall)
    )
    .map((p) => (
      <Grid item xs={4} key={p.id}>
        <Card>
          <CardContent>
            <Typography>{p.name}</Typography>
            <Typography color="text.secondary">{p.description}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => onAddPlugin(p)}>
              {t("addPlugin")}
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
          <Typography variant="h6">{t("plugins")}</Typography>
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
