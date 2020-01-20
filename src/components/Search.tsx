import {
  AppBar,
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { IAlbum, IArtist, IPlaylist, ISong } from "../models";
import { ISearchApi } from "../services/apis/ISearchApi";
import SoundCloud from "../services/apis/SoundCloud";
import Youtube from "../services/apis/Youtube";
import { addTrack } from "../store/reducers/songReducer";
import { AppDispatch } from "../store/store";
import { getThumbnailImage } from "../utils";

const thumbnailsize = 40;

const getApiByName = (name: string): ISearchApi | undefined => {
  switch (name) {
    case "youtube":
      return Youtube;
    case "soundcloud":
      return SoundCloud;
  }
};

interface IArtistResultProps {
  artist: IArtist;
  clearSearch: () => void;
  setAlbumResults: (albums: IAlbum[]) => void;
}
const ArtistResult: React.FC<IArtistResultProps> = props => {
  const onClickArtist = async () => {
    props.clearSearch();
    const api = getApiByName(props.artist.from);
    if (api) {
      if (api.setAuth) {
        api.setAuth("");
      }
      const albums = await api.getArtistAlbums(props.artist);
      props.setAlbumResults(albums);
    }
  };

  const image = getThumbnailImage(props.artist.images, thumbnailsize);
  return (
    <ListItem button={true} onClick={onClickArtist}>
      <ListItemAvatar>
        <Avatar
          alt={props.artist.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText>{props.artist.name}</ListItemText>
    </ListItem>
  );
};

interface IAlbumResultProps {
  album: IAlbum;
  clearSearch: () => void;
  setTrackResults: (songs: ISong[]) => void;
}
const AlbumResult: React.FC<IAlbumResultProps> = props => {
  const onClickAlbum = async () => {
    props.clearSearch();
    const api = getApiByName(props.album.from);
    if (api) {
      const songs = await api.getAlbumTracks(props.album);
      props.setTrackResults(songs);
    }
  };

  const image = getThumbnailImage(props.album.images, thumbnailsize);

  return (
    <ListItem button={true} onClick={onClickAlbum}>
      <ListItemAvatar>
        <Avatar
          alt={props.album.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText>
        {props.album.name} - {props.album.artistName}
      </ListItemText>
    </ListItem>
  );
};

interface ITrackResultProps {
  track: ISong;
}
const TrackResult: React.FC<ITrackResultProps> = props => {
  const dispatch = useDispatch<AppDispatch>();

  const onClickSong = () => {
    dispatch(addTrack(props.track));
  };

  const image = getThumbnailImage(props.track.images, thumbnailsize);
  return (
    <ListItem button={true} onClick={onClickSong}>
      <ListItemAvatar>
        <Avatar
          alt={props.track.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography dangerouslySetInnerHTML={{ __html: props.track.name }} />
        }
      />
    </ListItem>
  );
};

interface IPlaylistResultProps {
  playlist: IPlaylist;
  clearSearch: () => void;
  setTrackResults: (songs: ISong[]) => void;
}

const PlaylistResult: React.FC<IPlaylistResultProps> = props => {
  const onClickPlaylist = async () => {
    props.clearSearch();
    const api = getApiByName(props.playlist.from || "");
    if (api) {
      const songs = await api.getPlaylistTracks(props.playlist);
      props.setTrackResults(songs);
    }
  };
  const image = getThumbnailImage(props.playlist.images, thumbnailsize);
  return (
    <ListItem button={true} onClick={onClickPlaylist}>
      <ListItemAvatar>
        <Avatar
          alt={props.playlist.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            dangerouslySetInnerHTML={{ __html: props.playlist.name }}
          />
        }
      />
    </ListItem>
  );
};

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
    <TrackResult key={track.apiId} track={track} />
  ));
  const albumList = albumResults.map(album => (
    <AlbumResult
      key={album.apiId}
      album={album}
      clearSearch={onClearSearch}
      setTrackResults={setTrackResults}
    />
  ));
  const artistList = artistResults.map(artist => (
    <ArtistResult
      key={artist.apiId}
      artist={artist}
      clearSearch={onClearSearch}
      setAlbumResults={setAlbumResults}
    />
  ));
  const playlistList = playlistResults.map(playlist => (
    <PlaylistResult
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
