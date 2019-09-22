import { List, ListItem, ListItemText, Typography } from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { ISearchApi } from "../services/apis/ISearchApi";
import Napster from "../services/apis/Napster";
import SoundCloud from "../services/apis/SoundCloud";
import Spotify from "../services/apis/Spotify";
import Youtube from "../services/apis/Youtube";
import { IAlbum, IArtist, ISong } from "../services/data/database";
import { addTrack } from "../store/reducers/songReducer";

const getApiByName = (name: string): ISearchApi | undefined => {
  switch (name) {
    case "youtube":
      return Youtube;
    case "soundcloud":
      return SoundCloud;
    case "napster":
      return Napster;
    case "spotify":
      return Spotify;
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
  return (
    <ListItem button={true} onClick={onClickArtist}>
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
  return (
    <ListItem button={true} onClick={onClickAlbum}>
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
  const dispatch = useDispatch();

  const onClickSong = () => {
    dispatch(addTrack(props.track));
  };
  return (
    <ListItem button={true} onClick={onClickSong}>
      <ListItemText
        primary={
          <Typography dangerouslySetInnerHTML={{ __html: props.track.name }} />
        }
      />
    </ListItem>
  );
};

const Search: React.FC = () => {
  const [searchType, setSearchType] = React.useState("soundcloud");
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
    <div>
      <select value={searchType} onChange={onSearchTypeChange}>
        <option value="soundcloud">SoundCloud</option>
        <option value="youtube">Youtube</option>
        <option value="napster">Napster</option>
        <option value="spotify">Spotify</option>
      </select>
      <input type="text" onChange={onSearchChange} />
      <button onClick={onSearchClick}>Search</button>
      <button onClick={onClearSearch}>Clear Search Results</button>
      {trackList.length > 0 ? <div>Songs:</div> : null}
      <List>{trackList}</List>
      {albumList.length > 0 ? <div>Albums:</div> : null}
      <List>{albumList}</List>
      {artistList.length > 0 ? <div>Artists:</div> : null}
      <List>{artistList}</List>
    </div>
  );
};

export default Search;
