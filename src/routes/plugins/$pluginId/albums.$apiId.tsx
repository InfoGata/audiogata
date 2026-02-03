import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import Pager from "@/components/Pager";
import PlayButton from "@/components/PlayButton";
import PlaylistInfoCard from "@/components/PlaylistInfoCard";
import PlaylistMenu from "@/components/PlaylistMenu";
import Spinner from "@/components/Spinner";
import TrackList from "@/components/TrackList";
import { db } from "@/database";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import useSelected from "@/hooks/useSelected";
import { Album, PageInfo, Track } from "@/plugintypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playQueue, setTrack, setTracks } from "@/store/reducers/trackReducer";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const AlbumPage: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useRouterState({ select: (state) => state.location.state });
  const [albumInfo, setAlbumInfo] = React.useState<Album | undefined>(
    state.album
  );

  const dispatch = useAppDispatch();
  const plugin = plugins.find((p) => p.id === pluginId);

  const onFavorite = async () => {
    if (albumInfo) {
      await db.favoriteAlbums.add(albumInfo);
    }
  };

  const onRemoveFavorite = async () => {
    if (albumInfo) {
      const record = await db.favoriteAlbums.get({ pluginId, apiId });
      if (record?.id) {
        await db.favoriteAlbums.delete(record.id);
      }
    }
  };

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const playlists = useAppSelector((state) => state.playlist.playlists);

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
      setCurrentPage(albumData.pageInfo);
      return albumData.items;
    }
    return [];
  };

  const query = useQuery({
    queryKey: ["albumpage", pluginId, apiId, page],
    queryFn: onGetAlbum,
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
      <Spinner open={query.isLoading || isLoading} />
      {albumInfo && (
        <PlaylistInfoCard
          name={albumInfo.name || ""}
          subtitleLinks={[
            {
              name: albumInfo.artistName,
              link:
                albumInfo.artistApiId &&
                `/plugins/${pluginId}/artists/${albumInfo.artistApiId}`,
            },
            ...(albumInfo.addtionalArtists?.map((a) => ({
              name: a.name,
              link: a.apiId && `/plugins/${pluginId}/artists/${a.apiId}`,
            })) ?? []),
          ]}
          images={albumInfo.images}
        />
      )}
      <PlayButton onClick={onPlayClick} />
      <PlaylistMenu
        selected={selected}
        tracklist={tracklist}
        playlists={playlists}
        onFavorite={onFavorite}
        onRemoveFavorite={onRemoveFavorite}
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

export const Route = createFileRoute("/plugins/$pluginId/albums/$apiId")({
  component: AlbumPage,
});
