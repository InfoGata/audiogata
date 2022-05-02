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
import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { IAlbum, IArtist, IPlaylist, ISong } from "../models";
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

interface ITabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: ITabPanelProps) {
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
}

const Search: React.FC = () => {
  const [searchType, setSearchType] = React.useState("");
  const [trackResults, setTrackResults] = React.useState<ISong[]>([]);
  const [albumResults, setAlbumResults] = React.useState<IAlbum[]>([]);
  const [artistResults, setArtistResults] = React.useState<IArtist[]>([]);
  const [playlistResults, setPlaylistResults] = React.useState<IPlaylist[]>([]);
  const [tabValue, setTabValue] = React.useState("tracks");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = React.useState<ISong>({} as ISong);
  const [options, setOptions] = React.useState<[string, string][]>();
  const location = useLocation();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const onSearchTypeChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setSearchType(e.currentTarget.value);
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

  useEffect(() => {
    const onSearch = async (search: string) => {
      setBackdropOpen(true);
      let tracks: ISong[] | undefined = [];
      let albums: IAlbum[] | undefined = [];
      let artists: IArtist[] | undefined = [];
      let playlists: IPlaylist[] | undefined = [];
      const plugin = plugins.find((p) => p.id === searchType);
      if (plugin?.hasDefined.searchAll()) {
        ({ tracks, albums, artists, playlists } = await plugin.remote.searchAll(
          search
        ));
        tracks?.forEach((t) => {
          t.from = searchType;
        });
      }
      setAlbumResults(albums || []);
      setArtistResults(artists || []);
      setTrackResults(tracks || []);
      setPlaylistResults(playlists || []);
      setBackdropOpen(false);
    };
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query && query.length > 3) {
      onSearch(query);
    }
  }, [location.search, searchType, plugins]);

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    song: ISong
  ) => {
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
      setTrackResults={setTrackResults}
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
      setTrackResults={setTrackResults}
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
  return (
    <>
      <Backdrop open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <select value={searchType} onChange={onSearchTypeChange}>
        {optionsComponents}
      </select>
      <AppBar position="static">
        <Tabs
          value={tabValue}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {trackList.length > 0 ? <Tab label="Songs" value="tracks" /> : null}
          {albumList.length > 0 ? <Tab label="Albums" value="albums" /> : null}
          {artistList.length > 0 ? (
            <Tab label="Artists" value="artists" />
          ) : null}
          {playlistList.length > 0 ? (
            <Tab label="Playlists" value="playlists" />
          ) : null}
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index="tracks">
        <List dense={true}>{trackList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index="albums">
        <List dense={true}>{albumList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index="artists">
        <List dense={true}>{artistList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index="playlists">
        <List dense={true}>{playlistList}</List>
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
