import React, { Component } from "react";
import "./App.css";
import SoundCloud from "./services/apis/SoundCloud";
import Youtube from "./services/apis/Youtube";
import { ConfigService } from "./services/data/config.service";
import { IAlbum, IArtist, ISong } from "./services/data/database";
import { SongService } from "./services/data/song.service";

interface IAppState {
  src: string;
  playlist: ISong[];
  search: string;
  playlistIndex: number;
  doLoop: boolean;
  playOnStartup: boolean;
  storageUsed?: string;
  songResults: ISong[];
  albumResults: IAlbum[];
  artistResults: IArtist[];
  currentSong?: ISong;
}

class App extends Component<{}, IAppState> {
  private myRef = React.createRef<HTMLAudioElement>();
  private soundCloud = new SoundCloud();
  private songService = new SongService();
  private configService = new ConfigService();
  private youtube = new Youtube();

  constructor(props: any) {
    super(props);
    this.state = {
      albumResults: [],
      artistResults: [],
      doLoop: true,
      playOnStartup: true,
      playlist: [],
      playlistIndex: -1,
      search: "",
      songResults: [],
      src: "",
    };
  }

  public async componentDidMount() {
    const songs = await this.songService.getSongs();
    const storage = await this.getStorage();
    const currentSongId = await this.configService.getCurrentSongId();
    const time = await this.configService.getCurrentSongTime();
    this.setState(
      {
        playlist: songs,
        storageUsed: storage,
      },
      () => {
        if (this.state.playOnStartup && currentSongId) {
          const index = songs.findIndex(s => s.id === currentSongId);
          this.playSong(index, time);
        }
      },
    );
  }

  public render() {
    const songList = this.state.playlist.map((songInfo, index) => (
      <li key={index}>
        <a
          href="#"
          className={index === this.state.playlistIndex ? "Selected-Song" : ""}
          onClick={this.onPlaylistClick.bind(this, index)}
        >
          {songInfo.name}
        </a>
        <button onClick={this.onDeleteClick.bind(this, songInfo)}>
          Delete
        </button>
      </li>
    ));
    const songSearchList = this.state.songResults.map((song, index) => (
      <li key={index}>
        <a href="#" onClick={this.onClickSong.bind(this, song)}>
          {song.name}
        </a>
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
      <div className="App">
        <div>
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
        <div>
          <span>{this.state.storageUsed}% of Storage is being Used</span>
        </div>
        <div>
          <input type="file" onChange={this.onFileChange} multiple={true} />
        </div>
        <div>
          <button onClick={this.onPreviousClick}>Previous</button>
          <audio
            src={this.state.src}
            controls={true}
            ref={this.myRef}
            onEnded={this.onSongEnd}
            onTimeUpdate={this.onTimeUpdate}
          />
          <button onClick={this.onNextClick}>Next</button>
        </div>
        <ul>{songList}</ul>
      </div>
    );
  }

  private onClickSong = async (song: ISong, e: React.MouseEvent) => {
    e.preventDefault();
    const id = await this.songService.addSong(song);
    song.id = id;

    const currentPlaylist = this.state.playlist;
    currentPlaylist.push(song);
    this.setState({
      playlist: currentPlaylist,
    });
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
  };

  private onDeleteClick = async (song: ISong) => {
    await this.songService.deleteSong(song);
    if (this.state.currentSong && this.state.currentSong.id === song.id) {
      this.stopPlayer();
      await this.configService.setCurrentSongTime(0);
    }
    const newPlaylist = this.state.playlist.filter(s => s.id !== song.id);
    const currentIndex = newPlaylist.findIndex(
      s => s.id === (this.state.currentSong ? this.state.currentSong.id : -1),
    );
    const storage = await this.getStorage();
    this.setState({
      playlist: newPlaylist,
      playlistIndex: currentIndex,
      storageUsed: storage,
    });
  };

  private onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ search: e.currentTarget.value });
  };

  private onSearchClick = async () => {
    // const songs = await this.soundCloud.searchTracks(this.state.search);
    // const albums = await this.soundCloud.searchAlbums(this.state.search);
    // const artists = await this.soundCloud.searchArtists(this.state.search);
    const songs = await this.youtube.searchTracks(this.state.search);
    this.setState({
      // albumResults: albums,
      // artistResults: artists,
      songResults: songs,
    });
  };

  private async getStorage() {
    const estimate = await navigator.storage.estimate();
    if (estimate.usage && estimate.quota) {
      return ((100 * estimate.usage) / estimate.quota).toFixed(2);
    }
  }

  private onPreviousClick = () => {
    let newIndex = this.state.playlistIndex - 1;
    if (newIndex >= 0) {
      this.playSong(newIndex);
    } else if (this.state.doLoop) {
      newIndex = this.state.playlist.length - 1;
      this.playSong(newIndex);
    }
  };

  private onNextClick = () => {
    let newIndex = this.state.playlistIndex + 1;
    if (this.state.playlist.length > newIndex) {
      this.playSong(newIndex);
    } else if (this.state.doLoop) {
      newIndex = 0;
      this.playSong(newIndex);
    }
  };

  private onSongEnd = () => {
    this.onNextClick();
  };

  private onTimeUpdate = async () => {
    if (this.myRef.current) {
      this.configService.setCurrentSongTime(this.myRef.current.currentTime);
    }
  };

  private onFileChange = async (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const songs: ISong[] = [];

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileUrl = URL.createObjectURL(file);
        songs.push({
          blob: file,
          dateAdded: new Date(),
          from: "local",
          name: file.name,
          sortOrder: 0,
          source: fileUrl,
          useBlob: true,
        });
      }
      await this.songService.addSongs(songs);
      const allSongs = await this.songService.getSongs();
      const storage = await this.getStorage();
      this.setState({
        playlist: allSongs,
        storageUsed: storage,
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

  private isNotValidIndex(index: number) {
    return this.state.playlist[index] === undefined;
  }

  private async playSong(index: number, time?: number) {
    if (this.isNotValidIndex(index)) {
      return;
    }

    const song = this.state.playlist[index];
    await this.configService.setCurrentSong(song);
    let source = song.source;
    if (song.useBlob) {
      source = URL.createObjectURL(song.blob);
    }
    if (song.from === "soundcloud") {
      source = this.soundCloud.getTrackUrl(song);
    }
    if (song.from === "youtube") {
      source = await this.youtube.getTrackUrl(song);
    }
    this.setState(
      {
        currentSong: song,
        playlistIndex: index,
        src: source,
      },
      () => {
        this.reloadPlayer();
        if (time && this.myRef.current) {
          this.myRef.current.currentTime = time;
        }
      },
    );
  }

  private onPlaylistClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    this.playSong(index);
  };

  private stopPlayer() {
    if (this.myRef.current) {
      this.myRef.current.pause();
    }
  }

  private reloadPlayer() {
    if (this.myRef.current) {
      this.myRef.current.load();
      this.myRef.current.play();
    }
  }
}

export default App;
