import {
  AppBar,
  Box,
  Tab,
  Tabs,
  Typography,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import React from "react";
import { useLocation } from "react-router";
import { SearchAllResult } from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { SearchResultType } from "../types";
import SelectPlugin from "./SelectPlugin";
import { useQuery } from "react-query";
import TrackSearchResults from "./TrackSearchResults";
import AlbumSearchResults from "./AlbumSearchResults";
import ArtistSearchResults from "./ArtistSearchResults";
import PlaylistSearchResults from "./PlaylistSearchResults";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
};

const Search: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const [tabValue, setTabValue] = React.useState<string | boolean>(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

  const onSearch = async () => {
    let searchAll: SearchAllResult | undefined;
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      searchAll = await plugin.remote.onSearchAll({ query: searchQuery });
    }

    if (searchAll?.tracks) {
      setTabValue(SearchResultType.Tracks);
    } else if (searchAll?.albums) {
      setTabValue(SearchResultType.Albums);
    } else if (searchAll?.artists) {
      setTabValue(SearchResultType.Artists);
    } else if (searchAll?.playlists) {
      setTabValue(SearchResultType.Playlists);
    }

    return searchAll;
  };

  const query = useQuery(["search", pluginId, searchQuery], onSearch);
  const trackList = query?.data?.tracks?.items || [];
  const albumList = query?.data?.albums?.items || [];
  const artistList = query?.data?.artists?.items || [];
  const playlistList = query?.data?.playlists?.items || [];

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
  };

  // const pluginSearch = async (newPage: PageInfo, resultType: ResultType) => {
  //   const plugin = plugins.find((p) => p.id === pluginId);
  //   if (!plugin) {
  //     return;
  //   }

  //   const request: SearchRequest = { query: searchQuery, page: newPage };
  //   switch (resultType) {
  //     case ResultType.Tracks:
  //       const tracksResult = await plugin.remote.onSearchTracks(request);
  //       setTrackResults(tracksResult.items);
  //       setTrackPage(tracksResult.pageInfo);
  //       break;
  //     case ResultType.Albums:
  //       const albumsResult = await plugin.remote.onSearchAlbums(request);
  //       setAlbumResults(albumsResult.items);
  //       setAlbumPage(albumsResult.pageInfo);
  //       break;
  //     case ResultType.Artists:
  //       const artistsResult = await plugin.remote.onSearchArtists(request);
  //       setArtistResults(artistsResult.items);
  //       setArtistPage(artistsResult.pageInfo);
  //       break;
  //     case ResultType.Playlists:
  //       const playlistsResult = await plugin.remote.onSearchPlaylists(request);
  //       setPlaylistResults(playlistsResult.items);
  //       setPlaylistPage(playlistsResult.pageInfo);
  //       break;
  //   }
  // };

  // const pageButtons = (pageInfo: PageInfo, resultType: ResultType) => {
  //   const hasPrev = pageInfo.offset !== 0;
  //   const nextOffset = pageInfo.offset + pageInfo.resultsPerPage;
  //   const hasNext = nextOffset < pageInfo.totalResults;

  //   const onPrev = async () => {
  //     setBackdropOpen(true);
  //     const prevOffset = pageInfo.offset - pageInfo.resultsPerPage;
  //     const newPage: PageInfo = {
  //       offset: prevOffset,
  //       totalResults: pageInfo.totalResults,
  //       resultsPerPage: pageInfo.resultsPerPage,
  //       prevPage: pageInfo.prevPage,
  //     };
  //     await pluginSearch(newPage, resultType);
  //     setBackdropOpen(false);
  //   };

  //   const onNext = async () => {
  //     setBackdropOpen(true);
  //     const newPage: PageInfo = {
  //       offset: nextOffset,
  //       totalResults: pageInfo.totalResults,
  //       resultsPerPage: pageInfo.resultsPerPage,
  //       nextPage: pageInfo.nextPage,
  //     };
  //     await pluginSearch(newPage, resultType);
  //     setBackdropOpen(false);
  //   };

  //   return (
  //     <>
  //       {hasPrev && <Button onClick={onPrev}>Prev</Button>}
  //       {hasNext && <Button onClick={onNext}>Next</Button>}
  //     </>
  //   );
  // };

  return (
    <>
      <SelectPlugin
        pluginId={pluginId}
        setPluginId={setPluginId}
        methodName="onSearchAll"
      />
      <AppBar position="static">
        <Backdrop open={query.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {trackList.length > 0 ? (
            <Tab label="Tracks" value={SearchResultType.Tracks} />
          ) : null}
          {albumList.length > 0 ? (
            <Tab label="Albums" value={SearchResultType.Albums} />
          ) : null}
          {artistList && artistList.length > 0 ? (
            <Tab label="Artists" value={SearchResultType.Artists} />
          ) : null}
          {playlistList && playlistList.length > 0 ? (
            <Tab label="Playlists" value={SearchResultType.Playlists} />
          ) : null}
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index={SearchResultType.Tracks}>
        {trackList.length > 0 ? (
          <TrackSearchResults
            tracks={trackList}
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.tracks?.pageInfo}
          />
        ) : null}
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Albums}>
        {albumList.length > 0 ? (
          <AlbumSearchResults
            albums={albumList}
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.albums?.pageInfo}
          />
        ) : null}
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Artists}>
        {artistList.length > 0 ? (
          <ArtistSearchResults
            artists={artistList}
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.artists?.pageInfo}
          />
        ) : null}
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Playlists}>
        {playlistList.length > 0 ? (
          <PlaylistSearchResults
            playlists={playlistList}
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.playlists?.pageInfo}
          />
        ) : null}
      </TabPanel>
    </>
  );
};

export default Search;
