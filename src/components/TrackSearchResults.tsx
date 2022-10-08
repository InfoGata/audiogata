import { Backdrop, Button, CircularProgress, Grid, List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import useTrackMenu from "../hooks/useTrackMenu";
import { PageInfo } from "../plugintypes";
import TrackSearchResult from "./TrackSearchResult";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";

interface TrackSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
}

const TrackSearchResults: React.FC<TrackSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

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
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchTracks())) {
      const searchTracks = await plugin.remote.onSearchTracks({
        query: searchQuery,
        page: page,
      });
      setCurrentPage(searchTracks.pageInfo);
      return searchTracks.items;
    }
  };

  const query = useQuery(
    ["searchTracks", pluginId, searchQuery, page],
    search,
    { staleTime: 60 * 1000 }
  );

  const trackList = query.data?.map((track) => (
    <TrackSearchResult key={track.apiId} track={track} openMenu={openMenu} />
  ));

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <List>{trackList}</List>
      {hasSearch && (
        <Grid>
          {hasPreviousPage && (
            <Button onClick={onPreviousPage}>Previous</Button>
          )}
          {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
        </Grid>
      )}
    </>
  );
};

export default TrackSearchResults;
