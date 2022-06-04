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
  FormControl,
  InputLabel,
  NativeSelect,
  Button,
} from "@mui/material";
import React, { useEffect } from "react";
import { useLocation } from "react-router";
import {
  Album,
  Artist,
  IPlaylist,
  Song,
  PageInfo,
  ResultType,
  SearchRequest,
} from "../types";
import { filterAsync } from "../utils";
import AlbumSearchResult from "./AlbumSearchResult";
import ArtistSearchResult from "./ArtistSearchResult";
import PlaylistSearchResult from "./PlaylistSearchResult";
import TrackSearchResult from "./TrackSearchResult";
import { PlaylistPlay } from "@mui/icons-material";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { addTrack } from "../store/reducers/songReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { usePlugins } from "../PluginsContext";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchType, setSearchType] = React.useState("");
  const [trackResults, setTrackResults] = React.useState<Song[]>([]);
  const [albumResults, setAlbumResults] = React.useState<Album[]>([]);
  const [artistResults, setArtistResults] = React.useState<Artist[]>([]);
  const [playlistResults, setPlaylistResults] = React.useState<IPlaylist[]>([]);
  const [tabValue, setTabValue] = React.useState<string | boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = React.useState<Song>({} as Song);
  const [options, setOptions] = React.useState<[string, string][]>();
  const [trackPage, setTrackPage] = React.useState<PageInfo>();
  const [albumPage, setAlbumPage] = React.useState<PageInfo>();
  const [artistPage, setArtistPage] = React.useState<PageInfo>();
  const [playlistPage, setPlaylistPage] = React.useState<PageInfo>();
  const location = useLocation();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const onSearchTypeChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setSearchType(e.currentTarget.value);
  };

  const onSetTrackResults = (tracks: Song[]) => {
    setTrackResults(tracks);
    setTabValue(ResultType.Tracks);
  };
  const dispatch = useAppDispatch();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const { plugins } = usePlugins();

  const onClearSearch = () => {
    setTrackResults([]);
    setAlbumResults([]);
    setArtistResults([]);
    setPlaylistResults([]);
  };
  useEffect(() => {
    const getOptions = async () => {
      const validPlugins = await filterAsync(plugins, (p) =>
        p.hasDefined.searchAll()
      );
      setSearchType(validPlugins[0]?.id || "");
      const options: [string, string][] = validPlugins.map((p) => [
        p.id || "",
        p.name || "",
      ]);
      setOptions(options);
    };
    getOptions();
  }, [plugins]);

  const resetPagination = () => {
    setTrackPage(undefined);
    setAlbumPage(undefined);
    setArtistPage(undefined);
    setPlaylistPage(undefined);
  };

  useEffect(() => {
    resetPagination();
    const onSearch = async (search: string) => {
      setBackdropOpen(true);
      let tracks: Song[] | undefined = [];
      let albums: Album[] | undefined = [];
      let artists: Artist[] | undefined = [];
      let playlists: IPlaylist[] | undefined = [];
      const plugin = plugins.find((p) => p.id === searchType);
      if (plugin?.hasDefined.searchAll()) {
        const searchAll = await plugin.remote.searchAll({ query: search });
        tracks = searchAll.tracks?.items;
        setTrackPage(searchAll.tracks?.pageInfo);
        albums = searchAll.albums?.items;
        setAlbumPage(searchAll.albums?.pageInfo);
        artists = searchAll.artists?.items;
        setArtistPage(searchAll.artists?.pageInfo);
        playlists = searchAll.playlists?.items;
        setPlaylistPage(searchAll.playlists?.pageInfo);
      }
      setAlbumResults(albums || []);
      setArtistResults(artists || []);
      setTrackResults(tracks || []);
      setPlaylistResults(playlists || []);
      setBackdropOpen(false);
      setTabValue(ResultType.Tracks);
    };
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      setSearchQuery(query);
      onSearch(query);
    }
  }, [location.search, searchType, plugins]);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, song: Song) => {
    setAnchorEl(event.currentTarget);
    setMenuSong(song);
  };
  const closeMenu = () => setAnchorEl(null);
  const addSongToQueue = () => {
    dispatch(addTrack(menuSong));
    closeMenu();
  };
  const trackList = trackResults.map((track) => (
    <TrackSearchResult key={track.apiId} track={track} openMenu={openMenu} />
  ));
  const albumList = albumResults.map((album) => (
    <AlbumSearchResult
      key={album.apiId}
      album={album}
      clearSearch={onClearSearch}
      setTrackResults={onSetTrackResults}
    />
  ));
  const artistList = artistResults.map((artist) => (
    <ArtistSearchResult
      key={artist.apiId}
      artist={artist}
      clearSearch={onClearSearch}
      setAlbumResults={setAlbumResults}
    />
  ));
  const playlistList = playlistResults.map((playlist) => (
    <PlaylistSearchResult
      key={playlist.apiId}
      playlist={playlist}
      clearSearch={onClearSearch}
      setTrackResults={onSetTrackResults}
    />
  ));
  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
  };
  const optionsComponents = options?.map((option) => (
    <option key={option[0]} value={option[0]}>
      {option[1]}
    </option>
  ));

  const pluginSearch = async (newPage: PageInfo, resultType: ResultType) => {
    const plugin = plugins.find((p) => p.id === searchType);
    if (!plugin) {
      return;
    }

    const request: SearchRequest = { query: searchQuery, page: newPage };
    switch (resultType) {
      case ResultType.Tracks:
        const tracksResult = await plugin.remote.searchTracks(request);
        setTrackResults(tracksResult.items);
        setTrackPage(tracksResult.pageInfo);
        break;
      case ResultType.Albums:
        const albumsResult = await plugin.remote.searchAlbums(request);
        setAlbumResults(albumsResult.items);
        setAlbumPage(albumsResult.pageInfo);
        break;
      case ResultType.Artists:
        const artistsResult = await plugin.remote.searchArtists(request);
        setArtistResults(artistsResult.items);
        setArtistPage(artistsResult.pageInfo);
        break;
      case ResultType.Playlists:
        const playlistsResult = await plugin.remote.searchPlaylists(request);
        setPlaylistResults(playlistsResult.items);
        setPlaylistPage(playlistsResult.pageInfo);
        break;
    }
  };

  const pageButtons = (pageInfo: PageInfo, resultType: ResultType) => {
    const hasPrev = pageInfo.offset !== 0;
    const nextOffset = pageInfo.offset + pageInfo.resultsPerPage;
    const hasNext = nextOffset < pageInfo.totalResults;

    const onPrev = async () => {
      setBackdropOpen(true);
      const prevOffset = pageInfo.offset - pageInfo.resultsPerPage;
      const newPage: PageInfo = {
        offset: prevOffset,
        totalResults: pageInfo.totalResults,
        resultsPerPage: pageInfo.resultsPerPage,
        prevPage: pageInfo.prevPage,
      };
      await pluginSearch(newPage, resultType);
      setBackdropOpen(false);
    };

    const onNext = async () => {
      setBackdropOpen(true);
      const newPage: PageInfo = {
        offset: nextOffset,
        totalResults: pageInfo.totalResults,
        resultsPerPage: pageInfo.resultsPerPage,
        nextPage: pageInfo.nextPage,
      };
      await pluginSearch(newPage, resultType);
      setBackdropOpen(false);
    };

    return (
      <>
        {hasPrev && <Button onClick={onPrev}>Prev</Button>}
        {hasNext && <Button onClick={onNext}>Next</Button>}
      </>
    );
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel variant="standard" htmlFor="uncontrolled-native">
          Plugin
        </InputLabel>
        <NativeSelect
          value={searchType}
          onChange={onSearchTypeChange}
          inputProps={{
            name: "plugin",
            id: "uncontrolled-native",
          }}
        >
          {optionsComponents}
        </NativeSelect>
      </FormControl>
      <AppBar position="static">
        <Backdrop open={backdropOpen}>
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
            <Tab label="Songs" value={ResultType.Tracks} />
          ) : null}
          {albumList.length > 0 ? (
            <Tab label="Albums" value={ResultType.Albums} />
          ) : null}
          {artistList.length > 0 ? (
            <Tab label="Artists" value={ResultType.Artists} />
          ) : null}
          {playlistList.length > 0 ? (
            <Tab label="Playlists" value={ResultType.Playlists} />
          ) : null}
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index={ResultType.Tracks}>
        <List dense={true}>{trackList}</List>
        {trackPage && pageButtons(trackPage, ResultType.Tracks)}
      </TabPanel>
      <TabPanel value={tabValue} index={ResultType.Albums}>
        <List dense={true}>{albumList}</List>
        {albumPage && pageButtons(albumPage, ResultType.Albums)}
      </TabPanel>
      <TabPanel value={tabValue} index={ResultType.Artists}>
        <List dense={true}>{artistList}</List>
        {artistPage && pageButtons(artistPage, ResultType.Artists)}
      </TabPanel>
      <TabPanel value={tabValue} index={ResultType.Playlists}>
        <List dense={true}>{playlistList}</List>
        {playlistPage && pageButtons(playlistPage, ResultType.Playlists)}
      </TabPanel>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addSongToQueue}>
          <ListItemIcon>
            <PlaylistPlay />
          </ListItemIcon>
          <ListItemText primary="Add To Queue" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            songs={[menuSong]}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
    </>
  );
};

export default Search;
