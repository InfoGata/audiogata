import { Backdrop, CircularProgress, List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { FilterInfo, PageInfo } from "../plugintypes";
import ArtistSearchResult from "./ArtistSearchResult";
import Filtering from "./Filtering";
import Pager from "./Pager";

interface ArtistSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
  initialFilter?: FilterInfo;
}

const ArtistSearchResults: React.FC<ArtistSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage, initialFilter } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [filters, setFilters] = React.useState<FilterInfo | undefined>();

  const [hasSearch, setHasSearch] = React.useState(false);
  React.useEffect(() => {
    const getHasSearch = async () => {
      if (plugin) {
        const hasSearch = await plugin.hasDefined.onSearchArtists();
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
    if (plugin && (await plugin.hasDefined.onSearchArtists())) {
      const searchArtists = await plugin.remote.onSearchArtists({
        query: searchQuery,
        pageInfo: page,
        filterInfo: filters,
      });
      setCurrentPage(searchArtists.pageInfo);
      return searchArtists.items;
    }
  };

  const query = useQuery(
    ["searchArtists", pluginId, searchQuery, page, filters],
    search,
    {
      staleTime: 60 * 1000,
    }
  );

  const artistList = query.data?.map((artist) => (
    <ArtistSearchResult
      key={artist.apiId}
      artist={artist}
      pluginId={pluginId}
    />
  ));

  const applyFilters = (filters: FilterInfo) => {
    setFilters(filters);
    resetPage();
  };

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={applyFilters} />
      )}
      <List>{artistList}</List>
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

export default ArtistSearchResults;
