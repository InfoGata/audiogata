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
} from "@mui/material";
import React, { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { IAlbum, IArtist, IPlaylist, ISong } from "../models";
import { getApiByName } from "../utils";
import AlbumSearchResult from "./AlbumSearchResult";
import ArtistSearchResult from "./ArtistSearchResult";
import PlaylistSearchResult from "./PlaylistSearchResult";
import TrackSearchResult from "./TrackSearchResult";
import { PlaylistPlay } from "@mui/icons-material";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { useSelector } from "react-redux";
import { AppDispatch, AppState } from "../store/store";
import { useDispatch } from "react-redux";
import { addTrack } from "../store/reducers/songReducer";

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

const Search: React.FC<RouteComponentProps> = (props) => {
  const [searchType, setSearchType] = React.useState("youtube");
  const [trackResults, setTrackResults] = React.useState<ISong[]>([]);
  const [albumResults, setAlbumResults] = React.useState<IAlbum[]>([]);
  const [artistResults, setArtistResults] = React.useState<IArtist[]>([]);
  const [playlistResults, setPlaylistResults] = React.useState<IPlaylist[]>([]);
  const [tabValue, setTabValue] = React.useState("tracks");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = React.useState<ISong>({} as ISong);
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const plugins = useSelector((state: AppState) => state.plugin.plugins);
  const onSearchTypeChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setSearchType(e.currentTarget.value);
  };
  const dispatch = useDispatch<AppDispatch>();

  const onClearSearch = () => {
    setTrackResults([]);
    setAlbumResults([]);
    setArtistResults([]);
    setPlaylistResults([]);
  };

  useEffect(() => {
    const onSearch = async (search: string) => {
      let tracks: ISong[] | undefined = [];
      let albums: IAlbum[] | undefined = [];
      let artists: IArtist[] | undefined = [];
      let playlists: IPlaylist[] | undefined = [];
      const api = getApiByName(searchType);
      if (api) {
        ({ tracks, albums, artists, playlists } = await api.searchAll(search));
      }
      setAlbumResults(albums || []);
      setArtistResults(artists || []);
      setTrackResults(tracks || []);
      setPlaylistResults(playlists || []);
    };
    const params = new URLSearchParams(props.location.search);
    const query = params.get("q");
    if (query && query.length > 3) {
      onSearch(query);
    }
  }, [props.location.search, searchType, plugins]);

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
  return (
    <>
      <select value={searchType} onChange={onSearchTypeChange}>
        <option value="youtube">Youtube</option>
        <option value="soundcloud">SoundCloud</option>
        <option value="spotify">Spotify</option>
        <option value="napster">Napster</option>
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
