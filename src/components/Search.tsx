import React, { Component } from "react";
import { ISearchApi } from "../services/apis/ISearchApi";
import Napster from "../services/apis/Napster";
import SoundCloud from "../services/apis/SoundCloud";
import Spotify from "../services/apis/Spotify";
import Youtube from "../services/apis/Youtube";
import { IAlbum, IArtist, ISong } from "../services/data/database";
import { formatSeconds } from "../utils";

interface ISearchProps {
  onSelectSong: (song: ISong, e: React.MouseEvent) => void;
}

interface ISearchState {
  searchType: string;
  songResults: ISong[];
  albumResults: IAlbum[];
  artistResults: IArtist[];
  search: string;
}

class Search extends Component<ISearchProps, ISearchState> {
  constructor(props: any) {
    super(props);
    this.state = {
      albumResults: [],
      artistResults: [],
      search: "",
      searchType: "soundcloud",
      songResults: [],
    };
  }

  public render() {
    const songSearchList = this.state.songResults.map((song, index) => (
      <li key={index}>
        <a
          href="#"
          onClick={this.props.onSelectSong.bind(this, song)}
          dangerouslySetInnerHTML={{ __html: song.name }}
        />{" "}
        - {song.artistName} - {song.duration && formatSeconds(song.duration)}
      </li>
    ));
    const albumSearchList = this.state.albumResults.map(album => (
      <li key={album.apiId}>
        <a href="#" onClick={this.onClickAlbum.bind(this, album)}>
          {album.name}
        </a>{" "}
        - {album.artistName}
      </li>
    ));
    const artistSearchList = this.state.artistResults.map(artist => (
      <li key={artist.apiId}>
        <a href="#" onClick={this.onClickArtist.bind(this, artist)}>
          {artist.name}
        </a>
      </li>
    ));
    return (
      <div>
        <select
          value={this.state.searchType}
          onChange={this.onSearchTypeChange}
        >
          <option value="soundcloud">SoundCloud</option>
          <option value="youtube">Youtube</option>
          <option value="napster">Napster</option>
          <option value="spotify">Spotify</option>
        </select>
        <input type="text" onChange={this.onSearchChange} />
        <button onClick={this.onSearchClick}>Search</button>
        <button onClick={this.clearSearch}>Clear Search Results</button>
        {songSearchList.length > 0 ? <div>Songs:</div> : null}
        <ul>{songSearchList}</ul>
        {albumSearchList.length > 0 ? <div>Albums:</div> : null}
        <ul>{albumSearchList}</ul>
        {artistSearchList.length > 0 ? <div>Artists:</div> : null}
        <ul>{artistSearchList}</ul>
      </div>
    );
  }

  private onSearchClick = async () => {
    let tracks: ISong[] = [];
    let albums: IAlbum[] = [];
    let artists: IArtist[] = [];
    const api = this.getApiByName(this.state.searchType);
    if (api) {
      ({ tracks, albums, artists } = await api.searchAll(this.state.search));
    }
    this.setState({
      albumResults: albums,
      artistResults: artists,
      songResults: tracks,
    });
  };

  private getApiByName(name: string): ISearchApi | undefined {
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
  }

  private onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ search: e.currentTarget.value });
  };

  private onSearchTypeChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ searchType: e.currentTarget.value });
  };

  private onClickAlbum = async (album: IAlbum, e: React.MouseEvent) => {
    e.preventDefault();
    this.clearSearch();
    const api = this.getApiByName(album.from);
    if (api) {
      const songs = await api.getAlbumTracks(album);
      this.setState({
        songResults: songs,
      });
    }
  };

  private onClickArtist = async (artist: IArtist, e: React.MouseEvent) => {
    e.preventDefault();
    this.clearSearch();
    const api = this.getApiByName(artist.from);
    if (api) {
      const albums = await api.getArtistAlbums(artist);
      this.setState({
        albumResults: albums,
      });
    }
  };

  private clearSearch = () => {
    this.setState({
      albumResults: [],
      artistResults: [],
      songResults: [],
    });
  };
}

export default Search;
