import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { IAlbum, IArtist, ISong } from "../models";
import { ISearchApi } from "../services/apis/ISearchApi";
import SoundCloud from "../services/apis/SoundCloud";
import Youtube from "../services/apis/Youtube";
import { addTrack } from "../store/reducers/songReducer";
import { AppDispatch } from "../store/store";
import { getThumbnailImage } from "../utils";

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

  const image = getThumbnailImage(props.artist.images, 40);
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

  const image = getThumbnailImage(props.album.images, 40);

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

  const image = getThumbnailImage(props.track.images, 40);
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

const Search: React.FC = () => {
  const [searchType, setSearchType] = React.useState("youtube");
  const [search, setSearch] = React.useState("");
  const [trackResults, setTrackResults] = React.useState<ISong[]>([]);
  const [albumResults, setAlbumResults] = React.useState<IAlbum[]>([]);
  const [artistResults, setArtistResults] = React.useState<IArtist[]>([]);
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
  };

  const onSearchClick = async () => {
    let tracks: ISong[] = [];
    let albums: IAlbum[] = [];
    let artists: IArtist[] = [];
    const api = getApiByName(searchType);
    if (api) {
      ({ tracks, albums, artists } = await api.searchAll(search));
    }
    setAlbumResults(albums);
    setArtistResults(artists);
    setTrackResults(tracks);
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
  return (
    <>
      <select value={searchType} onChange={onSearchTypeChange}>
        <option value="youtube">Youtube</option>
        <option value="soundcloud">SoundCloud</option>
      </select>
      <input type="text" onChange={onSearchChange} />
      <Button onClick={onSearchClick}>Search</Button>
      <Button onClick={onClearSearch}>Clear Search Results</Button>
      {trackList.length > 0 ? <Typography>Songs:</Typography> : null}
      <List>{trackList}</List>
      {albumList.length > 0 ? <Typography>Albums:</Typography> : null}
      <List>{albumList}</List>
      {artistList.length > 0 ? <Typography>Artists:</Typography> : null}
      <List>{artistList}</List>
    </>
  );
};

export default Search;
