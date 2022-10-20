import { PlayCircle } from "@mui/icons-material";
import { Backdrop, CircularProgress, IconButton } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePagination from "../hooks/usePagination";
import useSelected from "../hooks/useSelected";
import useTrackMenu from "../hooks/useTrackMenu";
import { usePlugins } from "../PluginsContext";
import { Album, PageInfo, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { setTracks, setTrack, playQueue } from "../store/reducers/trackReducer";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import Pager from "./Pager";
import PlaylistInfoCard from "./PlaylistInfoCard";
import TrackList from "./TrackList";

const AlbumPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useLocation().state as Album | null;
  const [albumInfo, setAlbumInfo] = React.useState<Album | null>(state);
  const dispatch = useAppDispatch();
  const { openMenu } = useTrackMenu();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const onGetAlbum = async () => {
    if (plugin && (await plugin.hasDefined.onGetAlbumTracks())) {
      const albumData = await plugin.remote.onGetAlbumTracks({
        apiId: apiId,
        pageInfo: page,
      });
      if (albumData.album) {
        setAlbumInfo(albumData.album);
      }
      albumData.items.forEach((t) => {
        t.id = nanoid();
      });
      setCurrentPage(albumData.pageInfo);
      return albumData.items;
    }
    return [];
  };

  const query = useQuery(["albumpage", pluginId, apiId], onGetAlbum, {
    enabled: pluginsLoaded && !!plugin,
  });
  const tracklist = query.data || [];
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(
    query.data || []
  );

  const onTrackClick = (track: Track) => {
    dispatch(setTracks(tracklist));
    dispatch(setTrack(track));
  };

  const onPlayClick = () => {
    dispatch(setTracks(tracklist));
    dispatch(playQueue());
  };

  return (
    <>
      <Backdrop open={query.isLoading || isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {albumInfo && (
        <PlaylistInfoCard
          name={albumInfo.name || ""}
          subtitle={albumInfo.artistName}
          subtitleLink={
            albumInfo.artistApiId &&
            `/plugins/${pluginId}/artists/${albumInfo.artistApiId}`
          }
          images={albumInfo.images}
        />
      )}
      <IconButton size="large" onClick={onPlayClick}>
        <PlayCircle color="success" sx={{ fontSize: 45 }} />
      </IconButton>
      <TrackList
        tracks={tracklist}
        openMenu={openMenu}
        onTrackClick={onTrackClick}
        onSelect={onSelect}
        isSelected={isSelected}
        onSelectAll={onSelectAll}
        selected={selected}
        dragDisabled={true}
      />
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

export default AlbumPage;
