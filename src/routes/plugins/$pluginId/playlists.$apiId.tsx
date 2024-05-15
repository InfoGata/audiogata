import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import Pager from "@/components/Pager";
import PlayButton from "@/components/PlayButton";
import PlaylistInfoCard from "@/components/PlaylistInfoCard";
import PlaylistMenu from "@/components/PlaylistMenu";
import Spinner from "@/components/Spinner";
import TrackList from "@/components/TrackList";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import useSelected from "@/hooks/useSelected";
import { PageInfo, PlaylistInfo, Track } from "@/plugintypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playQueue, setTrack, setTracks } from "@/store/reducers/trackReducer";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import React from "react";
import { useQuery } from "react-query";
import { z } from "zod";

const PluginPlaylist: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { isUserPlaylist } = Route.useSearch();
  const state = useRouterState({ select: (s) => s.location.state });
  const [playlistInfo, setPlaylistInfo] = React.useState<
    PlaylistInfo | undefined
  >(state.playlistInfo);
  const dispatch = useAppDispatch();

  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const getPlaylistTracks = async () => {
    if (plugin && (await plugin.hasDefined.onGetPlaylistTracks())) {
      const t = await plugin.remote.onGetPlaylistTracks({
        apiId: apiId,
        isUserPlaylist: isUserPlaylist,
        pageInfo: page,
      });

      if (t.playlist) {
        setPlaylistInfo(t.playlist);
      }
      setCurrentPage(t.pageInfo);
      return t.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, apiId, page],
    getPlaylistTracks,
    { enabled: pluginsLoaded && !!plugin }
  );
  const tracklist = query.data ?? [];
  const { onSelect, onSelectAll, isSelected, selected } =
    useSelected(tracklist);

  const onPlayClick = () => {
    dispatch(setTracks(tracklist));
    dispatch(playQueue());
  };

  const onTrackClick = (track: Track) => {
    dispatch(setTracks(tracklist));
    dispatch(setTrack(track));
  };

  return (
    <>
      <Spinner open={query.isLoading || isLoading} />
      {playlistInfo && (
        <PlaylistInfoCard
          name={playlistInfo.name || ""}
          images={playlistInfo.images}
        />
      )}
      <PlayButton onClick={onPlayClick} />
      <PlaylistMenu
        selected={selected}
        tracklist={tracklist}
        playlists={playlists}
      />
      <TrackList
        tracks={tracklist}
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

const pluginPlaylistSearchSchema = z.object({
  isUserPlaylist: z.boolean().catch(false),
});

export const Route = createFileRoute("/plugins/$pluginId/playlists/$apiId")({
  component: PluginPlaylist,
  validateSearch: pluginPlaylistSearchSchema,
});
