import {
  AppBar,
  Box,
  Button,
  List,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import React from "react";
import { IAlbum, IArtist, IPlaylist, ISong } from "../models";
import { getApiByName } from "../utils";
import AlbumSearchResult from "./AlbumSearchResult";
import ArtistSearchResult from "./ArtistSearchResult";
import PlaylistSearchResult from "./PlaylistSearchResult";
import TrackSearchResult from "./TrackSearchResult";

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
  const [searchType, setSearchType] = React.useState("youtube");
  const [search, setSearch] = React.useState("");
  const [trackResults, setTrackResults] = React.useState<ISong[]>([]);
  const [albumResults, setAlbumResults] = React.useState<IAlbum[]>([]);
  const [artistResults, setArtistResults] = React.useState<IArtist[]>([]);
  const [playlistResults, setPlaylistResults] = React.useState<IPlaylist[]>([]);
  const [tabValue, setTabValue] = React.useState("tracks");
  const onSearchTypeChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setSearchType(e.currentTarget.value);
  };

  const onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  const onClearSearch = () => {
    setTrackResults([]);
    setAlbumResults([]);
    setArtistResults([]);
    setPlaylistResults([]);
  };

  const onSearchClick = async () => {
    let tracks: ISong[] = [];
    let albums: IAlbum[] = [];
    let artists: IArtist[] = [];
    let playlists: IPlaylist[] = [];
    const api = getApiByName(searchType);
    if (api) {
      ({ tracks, albums, artists, playlists } = await api.searchAll(search));
    }
    setAlbumResults(albums);
    setArtistResults(artists);
    setTrackResults(tracks);
    setPlaylistResults(playlists);
  };

  const trackList = trackResults.map(track => (
    <TrackSearchResult key={track.apiId} track={track} />
  ));
  const albumList = albumResults.map(album => (
    <AlbumSearchResult
      key={album.apiId}
      album={album}
      clearSearch={onClearSearch}
      setTrackResults={setTrackResults}
    />
  ));
  const artistList = artistResults.map(artist => (
    <ArtistSearchResult
      key={artist.apiId}
      artist={artist}
      clearSearch={onClearSearch}
      setAlbumResults={setAlbumResults}
    />
  ));
  const playlistList = playlistResults.map(playlist => (
    <PlaylistSearchResult
      key={playlist.apiId}
      playlist={playlist}
      clearSearch={onClearSearch}
      setTrackResults={setTrackResults}
    />
  ));
  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
  };
  return (
    <>
      <select value={searchType} onChange={onSearchTypeChange}>
        <option value="youtube">Youtube</option>
        <option value="soundcloud">SoundCloud</option>
      </select>
      <input type="text" onChange={onSearchChange} />
      <Button onClick={onSearchClick}>Search</Button>
      <Button onClick={onClearSearch}>Clear Search Results</Button>
      <AppBar position="static" color="default">
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
    </>
  );
};

export default Search;
