import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import usePlugins from "../hooks/usePlugins";
import PlaylistImage from "../components/PlaylistImage";
import Spinner from "../components/Spinner";
import { PageInfo, UserPlaylistRequest } from "../plugintypes";
import Pager from "../components/Pager";
import usePagination from "../hooks/usePagination";

const PluginPlaylists: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const plugin = plugins.find((p) => p.id === pluginId);

  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const getPlaylists = async () => {
    if (plugin && (await plugin.hasDefined.onGetUserPlaylists())) {
      const request: UserPlaylistRequest = {
        pageInfo: page,
      };
      const p = await plugin.remote.onGetUserPlaylists(request);
      setCurrentPage(p.pageInfo);
      return p.items;
    }
    return [];
  };

  const query = useQuery(["pluginplaylists", pluginId, page], getPlaylists, {
    enabled: pluginsLoaded && !!plugin,
  });
  const playlists = query.data || [];

  const playlistLinks = playlists.map((p, i) => (
    <Grid item xs={2} key={i}>
      <Card>
        <CardActionArea
          component={Link}
          to={`/plugins/${pluginId}/playlists/${p.apiId}?isuserplaylist`}
        >
          <PlaylistImage images={p.images} />
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
      <Spinner open={query.isLoading} />
      <Grid container spacing={2}>
        {playlistLinks}
      </Grid>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  ) : (
    <>{t("notFound")}</>
  );
};

export default PluginPlaylists;
