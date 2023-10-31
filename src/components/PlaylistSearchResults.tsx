import { List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { FilterInfo, PageInfo } from "../plugintypes";
import Filtering from "./Filtering";
import Pager from "./Pager";
import PlaylistSearchResult from "./PlaylistSearchResult";
import Spinner from "./Spinner";

interface PlaylistSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
  initialFilter?: FilterInfo;
}

const PlaylistSearchResults: React.FC<PlaylistSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage, initialFilter } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [filters, setFilters] = React.useState<FilterInfo | undefined>();

  const [hasSearch, setHasSearch] = React.useState(false);
  React.useEffect(() => {
    const getHasSearch = async () => {
      if (plugin) {
        const hasSearch = await plugin.hasDefined.onSearchPlaylists();
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
    if (plugin && (await plugin.hasDefined.onSearchPlaylists())) {
      const searchPlaylists = await plugin.remote.onSearchPlaylists({
        query: searchQuery,
        pageInfo: page,
        filterInfo: filters,
      });
      setCurrentPage(searchPlaylists.pageInfo);
      return searchPlaylists.items;
    }
  };

  const query = useQuery(
    ["searchPlaylists", pluginId, searchQuery, page, filters],
    search,
    { staleTime: 60 * 1000 }
  );

  const playlistList = query.data?.map((playlist) => (
    <PlaylistSearchResult
      key={playlist.apiId}
      playlist={playlist}
      pluginId={pluginId}
    />
  ));

  const applyFilters = (filters: FilterInfo) => {
    setFilters(filters);
    resetPage();
  };

  return (
    <>
      <Spinner open={query.isLoading} />
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={applyFilters} />
      )}
      <List>{playlistList}</List>
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

export default PlaylistSearchResults;
