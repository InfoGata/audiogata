import React, { Component } from "react";
import Napster from "../services/apis/Napster";
import SoundCloud from "../services/apis/SoundCloud";
import Youtube from "../services/apis/Youtube";
import { IAlbum, IArtist, ISong } from "../services/data/database";

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
  private youtube = new Youtube();
  private soundCloud = new SoundCloud();
  private napster = new Napster();
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
        />
      </li>
    ));
    const albumSearchList = this.state.albumResults.map(album => (
      <li key={album.apiId}>
        <a href="#" onClick={this.onClickAlbum.bind(this, album)}>
          {album.name}
        </a>
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
    let songs: ISong[] = [];
    let albums: IAlbum[] = [];
    let artists: IArtist[] = [];
    if (this.state.searchType === "soundcloud") {
      [songs, albums, artists] = await Promise.all([
        this.soundCloud.searchTracks(this.state.search),
        this.soundCloud.searchAlbums(this.state.search),
        this.soundCloud.searchArtists(this.state.search),
      ]);
    }
    if (this.state.searchType === "youtube") {
      songs = await this.youtube.searchTracks(this.state.search);
    }
    if (this.state.searchType === "napster") {
      [songs, albums, artists] = await Promise.all([
        this.napster.searchTracks(this.state.search),
        this.napster.searchAlbums(this.state.search),
        this.napster.searchArtists(this.state.search),
      ]);
    }
    this.setState({
      albumResults: albums,
      artistResults: artists,
      songResults: songs,
    });
  };

  private onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ search: e.currentTarget.value });
  };

  private onSearchTypeChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ searchType: e.currentTarget.value });
  };

  private onClickAlbum = async (album: IAlbum, e: React.MouseEvent) => {
    e.preventDefault();
    this.clearSearch();
    if (album.from === "soundcloud") {
      const songs = await this.soundCloud.getAlbumTracks(album);
      this.setState({
        songResults: songs,
      });
    }
    if (album.from === "napster") {
      const songs = await this.napster.getAlbumTracks(album);
      this.setState({
        songResults: songs,
      });
    }
  };

  private onClickArtist = async (artist: IArtist, e: React.MouseEvent) => {
    e.preventDefault();
    this.clearSearch();
    if (artist.from === "soundcloud") {
      const albums = await this.soundCloud.getArtistAlbums(artist);
      this.setState({
        albumResults: albums,
      });
    }
    if (artist.from === "napster") {
      const albums = await this.napster.getArtistAlbums(artist);
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
