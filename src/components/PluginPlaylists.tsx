import {
  Backdrop,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { Image } from "mui-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import usePlugins from "../hooks/usePlugins";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

const PluginPlaylists: React.FC = () => {
  const { plugins } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
  const { t } = useTranslation();
  const plugin = plugins.find((p) => p.id === pluginId);

  const getPlaylists = async () => {
    if (plugin && (await plugin.hasDefined.onGetUserPlaylists())) {
      const request = {};
      const p = await plugin.remote.onGetUserPlaylists(request);
      return p.items;
    }
    return [];
  };

  const query = useQuery(["pluginplaylists", pluginId], getPlaylists);
  const playlists = query.data || [];

  const playlistLinks = playlists.map((p, i) => (
    <Grid item xs={2} key={i}>
      <Card>
        <CardActionArea
          component={Link}
          to={`/plugins/${pluginId}/playlists/${p.apiId}?isuserplaylist`}
        >
          <Image
            src={getThumbnailImage(p.images, playlistThumbnailSize)}
            height={playlistThumbnailSize}
          />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              {p.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  ));
  return plugin ? (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={2}>
        {playlistLinks}
      </Grid>
    </>
  ) : (
    <>{t("notFound")}</>
  );
};

export default PluginPlaylists;
