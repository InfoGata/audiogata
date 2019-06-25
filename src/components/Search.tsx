import React from "react";
import { ISearchApi } from "../services/apis/ISearchApi";
import Napster from "../services/apis/Napster";
import SoundCloud from "../services/apis/SoundCloud";
import Spotify from "../services/apis/Spotify";
import Youtube from "../services/apis/Youtube";
import { IAlbum, IArtist, ISong } from "../services/data/database";
import { formatSeconds } from "../utils";

interface ISearchProps {
  onSelectSong: (song: ISong) => void;
}

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
const ArtistResult = (props: IArtistResultProps) => {
  const onClickArtist = async (e: React.MouseEvent) => {
    e.preventDefault();
    props.clearSearch();
    const api = getApiByName(props.artist.from);
    if (api) {
      const albums = await api.getArtistAlbums(props.artist);
      props.setAlbumResults(albums);
    }
  };
  return (
    <li key={props.artist.apiId}>
      <a href="#" onClick={onClickArtist}>
        {props.artist.name}
      </a>
    </li>
  );
};

interface IAlbumResultProps {
  album: IAlbum;
  clearSearch: () => void;
  setTrackResults: (songs: ISong[]) => void;
}
const AlbumResult = (props: IAlbumResultProps) => {
  const onClickAlbum = async (e: React.MouseEvent) => {
    e.preventDefault();
    props.clearSearch();
    const api = getApiByName(props.album.from);
    if (api) {
      const songs = await api.getAlbumTracks(props.album);
      props.setTrackResults(songs);
    }
  };
  return (
    <li key={props.album.apiId}>
      <a href="#" onClick={onClickAlbum}>
        {props.album.name}
      </a>{" "}
      - {props.album.artistName}
    </li>
  );
};

interface ITrackResultProps {
  track: ISong;
  onSelectSong: (song: ISong) => void;
}
const TrackResult = (props: ITrackResultProps) => {
  const onClickSong = () => {
    props.onSelectSong(props.track);
  };
  return (
    <li key={props.track.apiId}>
      <a
        href="#"
        onClick={onClickSong}
        dangerouslySetInnerHTML={{ __html: props.track.name }}
      />{" "}
      - {props.track.artistName} -{" "}
      {props.track.duration && formatSeconds(props.track.duration)}
    </li>
  );
};

const Search = (props: ISearchProps) => {
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
    <TrackResult
      key={track.apiId}
      track={track}
      onSelectSong={props.onSelectSong}
    />
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
      <ul>{trackList}</ul>
      {albumList.length > 0 ? <div>Albums:</div> : null}
      <ul>{albumList}</ul>
      {artistList.length > 0 ? <div>Artists:</div> : null}
      <ul>{artistList}</ul>
    </div>
  );
};

export default Search;