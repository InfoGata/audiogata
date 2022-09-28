import { List, Grid, Button, Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";
import { Artist, PageInfo } from "../plugintypes";
import ArtistSearchResult from "./ArtistSearchResult";

interface ArtistSearchResultsProps {
  artists: Artist[];
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
}

const ArtistSearchResults: React.FC<ArtistSearchResultsProps> = (props) => {
  const { artists, pluginId, searchQuery, initialPage } = props;

  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchArtists())) {
      const searchArtists = await plugin.remote.onSearchArtists({
        query: searchQuery,
        page: page,
      });
      setCurrentPage(searchArtists.pageInfo);
      return searchArtists.items;
    }

    return artists;
  };

  const query = useQuery(
    ["searchArtists", pluginId, searchQuery, page],
    search,
    {
      initialData: artists,
      staleTime: 1000,
    }
  );

  const artistList = query.data?.map((artist) => (
    <ArtistSearchResult
      key={artist.apiId}
      artist={artist}
      pluginId={pluginId}
    />
  ));

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <List>{artistList}</List>
      <Grid>
        {hasPreviousPage && <Button onClick={onPreviousPage}>Previous</Button>}
        {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
      </Grid>
    </>
  );
};

export default ArtistSearchResults;
