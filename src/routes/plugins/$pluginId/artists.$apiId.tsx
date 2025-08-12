import { createFileRoute, useRouterState } from "@tanstack/react-router";
import AlbumCard from "@/components/AlbumCard";
import CardContainer from "@/components/CardContainer";
import ItemMenu from "@/components/ItemMenu";
import React from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import Pager from "@/components/Pager";
import PlaylistInfoCard from "@/components/PlaylistInfoCard";
import Spinner from "@/components/Spinner";
import TrackList from "@/components/TrackList";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import useSelected from "@/hooks/useSelected";
import { Artist, PageInfo, Track } from "@/plugintypes";
import { useAppDispatch } from "@/store/hooks";
import { setTrack, setTracks } from "@/store/reducers/trackReducer";

const ArtistPage: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useRouterState({ select: (state) => state.location.state });
  const [artistInfo, setArtistInfo] = React.useState<Artist | undefined>(
    state.artist
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

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

  const onGetTopTracks = async () => {
    if (plugin && (await plugin.hasDefined.onGetArtistTopTracks())) {
      const topTracksData = await plugin.remote.onGetArtistTopTracks({
        apiId: apiId,
      });
      if (topTracksData.artist && !artistInfo) {
        setArtistInfo(topTracksData.artist);
      }
      return topTracksData.items;
    }
    return [];
  };

  const topTracksQuery = useQuery(
    ["artisttoptracks", pluginId, apiId],
    onGetTopTracks,
    {
      enabled: pluginsLoaded && !!plugin,
    }
  );

  const topTracks = topTracksQuery.data || [];
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(topTracks);

  const onTrackClick = (track: Track) => {
    dispatch(setTracks(topTracks));
    dispatch(setTrack(track));
  };

  return (
    <>
      <Spinner open={query.isLoading || topTracksQuery.isLoading || isLoading} />
      {artistInfo && (
        <PlaylistInfoCard
          name={artistInfo.name || ""}
          images={artistInfo.images}
        />
      )}
      {artistInfo && (
        <ItemMenu itemType={{ type: "artist", item: artistInfo }} />
      )}
      {topTracks.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4">{t("topTracks")}</h2>
          <TrackList
            tracks={topTracks}
            onTrackClick={onTrackClick}
            onSelect={onSelect}
            isSelected={isSelected}
            onSelectAll={onSelectAll}
            selected={selected}
            dragDisabled={true}
          />
        </>
      )}
      <h2 className="text-2xl font-bold mb-4 mt-8">{t("albums")}</h2>
      <CardContainer>
        {query.data?.map((a) => <AlbumCard key={a.id} album={a} noArtist={true} />)}
      </CardContainer>
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

export const Route = createFileRoute("/plugins/$pluginId/artists/$apiId")({
  component: ArtistPage,
});
