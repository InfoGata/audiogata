import { List, Grid, Button, Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";
import { PageInfo } from "../plugintypes";
import PlaylistSearchResult from "./PlaylistSearchResult";

interface PlaylistSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
}

const PlaylistSearchResults: React.FC<PlaylistSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage } = props;

  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchPlaylists())) {
      const searchPlaylists = await plugin.remote.onSearchPlaylists({
        query: searchQuery,
        page: page,
      });
      setCurrentPage(searchPlaylists.pageInfo);
      return searchPlaylists.items;
    }
  };

  const query = useQuery(
    ["searchPlaylists", pluginId, searchQuery, page],
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

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <List>{playlistList}</List>
      <Grid>
        {hasPreviousPage && <Button onClick={onPreviousPage}>Previous</Button>}
        {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
      </Grid>
    </>
  );
};

export default PlaylistSearchResults;
