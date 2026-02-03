import React from "react";
import { useQuery } from "@tanstack/react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { FilterInfo, PageInfo, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addTrack, setTrack } from "../store/reducers/trackReducer";
import Filtering from "./Filtering";
import Pager from "./Pager";
import Spinner from "./Spinner";
import TrackList from "./TrackList";

interface TrackSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
  initialFilter?: FilterInfo;
}

const TrackSearchResults: React.FC<TrackSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage, initialFilter } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [filters, setFilters] = React.useState<FilterInfo | undefined>();
  const dispatch = useAppDispatch();

  const [hasSearch, setHasSearch] = React.useState(false);
  React.useEffect(() => {
    const getHasSearch = async () => {
      if (plugin) {
        const hasSearch = await plugin.hasDefined.onSearchTracks();
        setHasSearch(hasSearch);
      }
    };
    getHasSearch();
  }, [plugin]);

  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );
  const {
    page,
    hasNextPage,
    hasPreviousPage,
    onPreviousPage,
    onNextPage,
    resetPage,
  } = usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchTracks())) {
      const searchTracks = await plugin.remote.onSearchTracks({
        query: searchQuery,
        pageInfo: page,
        filterInfo: filters,
      });
      setCurrentPage(searchTracks.pageInfo);
      return searchTracks.items;
    }
  };

  const query = useQuery({
    queryKey: ["searchTracks", pluginId, searchQuery, page, filters],
    queryFn: search,
    staleTime: 60 * 1000,
  });

  const applyFilters = (filters: FilterInfo) => {
    setFilters(filters);
    resetPage();
  };

  const onTrackClick = (track: Track) => {
    dispatch(addTrack(track));
    dispatch(setTrack(track));
  };

  return (
    <>
      <Spinner open={query.isLoading} />
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={applyFilters} />
      )}
      <TrackList
        tracks={query.data || []}
        onTrackClick={onTrackClick}
        dragDisabled={true}
      />
      {hasSearch && (
        <Pager
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
        />
      )}
    </>
  );
};

export default TrackSearchResults;
