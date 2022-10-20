import { List, Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";
import { PageInfo } from "../plugintypes";
import AlbumSearchResult from "./AlbumSearchResult";
import Pager from "./Pager";

interface AlbumSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
}

const AlbumSearchResults: React.FC<AlbumSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage } = props;

  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

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
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchAlbums())) {
      const searchAlbums = await plugin.remote.onSearchAlbums({
        query: searchQuery,
        pageInfo: page,
      });
      setCurrentPage(searchAlbums.pageInfo);
      return searchAlbums.items;
    }
  };

  const query = useQuery(
    ["searchAlbums", pluginId, searchQuery, page],
    search,
    { staleTime: 60 * 1000 }
  );

  const albumList = query.data?.map((album) => (
    <AlbumSearchResult key={album.apiId} album={album} pluginId={pluginId} />
  ));

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <List>{albumList}</List>
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
