import { MoreHoriz } from "@mui/icons-material";
import { Backdrop, CircularProgress, IconButton, List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import useItemMenu from "../hooks/useItemMenu";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { Artist, PageInfo } from "../plugintypes";
import AlbumSearchResult from "./AlbumSearchResult";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import Pager from "./Pager";
import PlaylistInfoCard from "./PlaylistInfoCard";

const ArtistPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useLocation().state as Artist | null;
  const [artistInfo, setArtistInfo] = React.useState<Artist | null>(state);
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });
  const { openMenu } = useItemMenu();
  const openArtistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (artistInfo) {
      openMenu(event, { type: "artist", item: artistInfo });
    }
  };

  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const onGetArtist = async () => {
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
    enabled: pluginsLoaded && !!plugin,
  });

  const albumsList = query.data?.map((a) => (
    <AlbumSearchResult key={a.apiId} album={a} pluginId={pluginId || ""} />
  ));

  return (
    <>
      <Backdrop open={query.isLoading || isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {artistInfo && (
        <PlaylistInfoCard
          name={artistInfo.name || ""}
          images={artistInfo.images}
        />
      )}
      <IconButton onClick={openArtistMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      <List>{albumsList}</List>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default ArtistPage;
