import { Backdrop, Button, CircularProgress, Grid, List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";
import { Artist, PageInfo } from "../plugintypes";
import AlbumSearchResult from "./AlbumSearchResult";
import PlaylistInfoCard from "./PlaylistInfoCard";

const ArtistPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useLocation().state as Artist | null;
  const [artistInfo, setArtistInfo] = React.useState<Artist | null>(state);

  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const onGetArtist = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onGetArtistAlbums())) {
      const artistData = await plugin.remote.onGetArtistAlbums({
        apiId: apiId,
        pageInfo: page,
      });
      if (artistData.artist) {
        setArtistInfo(artistData.artist);
      }
      setCurrentPage(artistData.pageInfo);
      return artistData.items;
    }
    return [];
  };

  const query = useQuery(["artistpage", pluginId, apiId, page], onGetArtist, {
    enabled: pluginsLoaded,
  });

  const albumsList = query.data?.map((a) => (
    <AlbumSearchResult key={a.apiId} album={a} pluginId={pluginId || ""} />
  ));

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {artistInfo && (
        <PlaylistInfoCard
          name={artistInfo.name || ""}
          images={artistInfo.images}
        />
      )}
      <List>{albumsList}</List>
      <Grid>
        {hasPreviousPage && <Button onClick={onPreviousPage}>Previous</Button>}
        {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
      </Grid>
    </>
  );
};

export default ArtistPage;
