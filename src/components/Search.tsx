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
import {
  Album,
  Artist,
  PlaylistInfo,
  SearchAllResult,
  Track,
} from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { SearchResultType } from "../types";
import SelectPlugin from "./SelectPlugin";
import { useQuery, useQueryClient } from "react-query";
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
  const queryClient = useQueryClient();

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

    queryClient.setQueryData<Track[] | undefined>(
      ["searchTracks", pluginId, searchQuery, undefined],
      searchAll?.tracks?.items
    );
    queryClient.setQueryData<Album[] | undefined>(
      ["searchAlbums", pluginId, searchQuery, undefined],
      searchAll?.albums?.items
    );
    queryClient.setQueryData<Artist[] | undefined>(
      ["searchArtists", pluginId, searchQuery, undefined],
      searchAll?.artists?.items
    );
    queryClient.setQueryData<PlaylistInfo[] | undefined>(
      ["searchPlaylists", pluginId, searchQuery, undefined],
      searchAll?.playlists?.items
    );

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
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.tracks?.pageInfo}
          />
        ) : null}
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Albums}>
        {albumList.length > 0 ? (
          <AlbumSearchResults
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.albums?.pageInfo}
          />
        ) : null}
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Artists}>
        {artistList.length > 0 ? (
          <ArtistSearchResults
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.artists?.pageInfo}
          />
        ) : null}
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Playlists}>
        {playlistList.length > 0 ? (
          <PlaylistSearchResults
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
