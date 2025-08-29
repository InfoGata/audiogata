import React from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import TrackList from "@/components/TrackList";
import Pager from "@/components/Pager";
import useSelected from "@/hooks/useSelected";
import usePagination from "@/hooks/usePagination";
import { Artist, Track, PageInfo } from "@/plugintypes";
import { useAppDispatch } from "@/store/hooks";
import { setTrack, setTracks } from "@/store/reducers/trackReducer";

interface ArtistTopTracksProps {
  pluginId: string;
  apiId: string;
  plugin: any;
  pluginsLoaded: boolean;
  onArtistInfoUpdate?: (artist: Artist) => void;
  onTopTracksUpdate?: (tracks: Track[]) => void;
}

const ArtistTopTracks: React.FC<ArtistTopTracksProps> = ({
  pluginId,
  apiId,
  plugin,
  pluginsLoaded,
  onArtistInfoUpdate,
  onTopTracksUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const onGetTopTracks = async () => {
    if (plugin && (await plugin.hasDefined.onGetArtistTopTracks())) {
      const topTracksData = await plugin.remote.onGetArtistTopTracks({
        apiId: apiId,
        pageInfo: page,
      });
      if (topTracksData.artist && onArtistInfoUpdate) {
        onArtistInfoUpdate(topTracksData.artist);
      }
      setCurrentPage(topTracksData.pageInfo);
      return topTracksData.items;
    }
    return [];
  };

  const topTracksQuery = useQuery(
    ["artisttoptracks", pluginId, apiId, page],
    onGetTopTracks,
    {
      enabled: pluginsLoaded && !!plugin,
    }
  );

  const topTracks = React.useMemo(() => topTracksQuery.data || [], [topTracksQuery.data]);
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(topTracks);

  React.useEffect(() => {
    if (onTopTracksUpdate && !topTracksQuery.isLoading) {
      onTopTracksUpdate(topTracks);
    }
  }, [topTracks, topTracksQuery.isLoading, onTopTracksUpdate]);

  const onTrackClick = (track: Track) => {
    dispatch(setTracks(topTracks));
    dispatch(setTrack(track));
  };

  if (topTracks.length === 0) {
    return null;
  }

  return (
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
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  );
};

export default ArtistTopTracks;