import {
  AppBar,
  Box,
  List,
  Tab,
  Tabs,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import React from "react";
import { useLocation } from "react-router";
import { Album, Artist, Track, PlaylistInfo } from "../plugintypes";
import AlbumSearchResult from "./AlbumSearchResult";
import ArtistSearchResult from "./ArtistSearchResult";
import PlaylistSearchResult from "./PlaylistSearchResult";
import TrackSearchResult from "./TrackSearchResult";
import { PlaylistPlay } from "@mui/icons-material";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { addTrack } from "../store/reducers/trackReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { usePlugins } from "../PluginsContext";
import { SearchResultType } from "../types";
import SelectPlugin from "./SelectPlugin";
import { useQuery } from "react-query";

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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuTrack, setMenuTrack] = React.useState<Track>();
  const location = useLocation();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  const dispatch = useAppDispatch();
  const { plugins } = usePlugins();

  const onSearch = async () => {
    let tracks: Track[] | undefined = [];
    let albums: Album[] | undefined = [];
    let artists: Artist[] | undefined = [];
    let playlists: PlaylistInfo[] | undefined = [];
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      const searchAll = await plugin.remote.onSearchAll({ query: searchQuery });
      tracks = searchAll.tracks?.items || [];
      albums = searchAll.albums?.items || [];
      artists = searchAll.artists?.items || [];
      playlists = searchAll.playlists?.items || [];
    }

    if (tracks) {
      setTabValue(SearchResultType.Tracks);
    } else if (albums) {
      setTabValue(SearchResultType.Albums);
    } else if (artists) {
      setTabValue(SearchResultType.Artists);
    } else if (playlists) {
      setTabValue(SearchResultType.Playlists);
    }

    return {
      albums,
      artists,
      tracks,
      playlists,
    };
  };

  const query = useQuery(["search", pluginId, searchQuery], onSearch);

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuTrack(track);
  };
  const closeMenu = () => setAnchorEl(null);
  const addTrackToQueue = () => {
    if (menuTrack) {
      dispatch(addTrack(menuTrack));
    }
    closeMenu();
  };
  const trackList = query.data?.tracks.map((track) => (
    <TrackSearchResult key={track.apiId} track={track} openMenu={openMenu} />
  ));
  const albumList = query.data?.albums.map((album) => (
    <AlbumSearchResult key={album.apiId} album={album} pluginId={pluginId} />
  ));
  const artistList = query.data?.artists.map((artist) => (
    <ArtistSearchResult
      key={artist.apiId}
      artist={artist}
      pluginId={pluginId}
    />
  ));
  const playlistList = query.data?.playlists.map((playlist) => (
    <PlaylistSearchResult
      key={playlist.apiId}
      playlist={playlist}
      pluginId={pluginId}
    />
  ));
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
          {trackList && trackList.length > 0 ? (
            <Tab label="Tracks" value={SearchResultType.Tracks} />
          ) : null}
          {albumList && albumList.length > 0 ? (
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
        <List dense={true}>{trackList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Albums}>
        <List dense={true}>{albumList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Artists}>
        <List dense={true}>{artistList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Playlists}>
        <List dense={true}>{playlistList}</List>
      </TabPanel>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addTrackToQueue}>
          <ListItemIcon>
            <PlaylistPlay />
          </ListItemIcon>
          <ListItemText primary="Add To Queue" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={menuTrack ? [menuTrack] : []}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
    </>
  );
};

export default Search;
