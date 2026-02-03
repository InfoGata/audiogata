import React from "react";
import { useQuery } from "@tanstack/react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { FilterInfo, PageInfo } from "../plugintypes";
import AlbumCard from "./AlbumCard";
import CardContainer from "./CardContainer";
import Filtering from "./Filtering";
import Pager from "./Pager";
import Spinner from "./Spinner";

interface AlbumSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
  initialFilter?: FilterInfo;
}

const AlbumSearchResults: React.FC<AlbumSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage, initialFilter } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [filters, setFilters] = React.useState<FilterInfo | undefined>();

  const [hasSearch, setHasSearch] = React.useState(false);
  React.useEffect(() => {
    const getHasSearch = async () => {
      if (plugin) {
        const hasSearch = await plugin.hasDefined.onSearchAlbums();
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
    if (plugin && (await plugin.hasDefined.onSearchAlbums())) {
      const searchAlbums = await plugin.remote.onSearchAlbums({
        query: searchQuery,
        pageInfo: page,
        filterInfo: filters,
      });
      setCurrentPage(searchAlbums.pageInfo);
      return searchAlbums.items;
    }
  };

  const query = useQuery({
    queryKey: ["searchAlbums", pluginId, searchQuery, page, filters],
    queryFn: search,
    staleTime: 60 * 1000,
  });

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
      <CardContainer>
        {query.data?.map((a) => <AlbumCard key={a.id} album={a} />)}
      </CardContainer>
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

export default AlbumSearchResults;
