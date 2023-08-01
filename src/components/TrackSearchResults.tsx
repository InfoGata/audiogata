import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import useTrackMenu from "../hooks/useTrackMenu";
import { FilterInfo, PageInfo, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addTrack, setTrack } from "../store/reducers/trackReducer";
import Filtering from "./Filtering";
import Pager from "./Pager";
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

  const { openMenu } = useTrackMenu();
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

  const query = useQuery(
    ["searchTracks", pluginId, searchQuery, page, filters],
    search,
    { staleTime: 60 * 1000 }
  );

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
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={applyFilters} />
      )}
      <TrackList
        tracks={query.data || []}
        openMenu={openMenu}
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
