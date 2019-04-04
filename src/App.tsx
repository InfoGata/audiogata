import React, { Component } from "react";
import "./App.css";
import NapsterComponent from "./components/Napster";
import Player from "./components/Player";
import Progress from "./components/Progress";
import SpotifyComponent from "./components/Spotify";
import Volume from "./components/Volume";
import Napster from "./services/apis/Napster";
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
  songResults: ISong[];
  albumResults: IAlbum[];
  artistResults: IArtist[];
  currentSong?: ISong;
  searchType: string;
  isPlaying: boolean;
  elapsed: number;
  total: number;
  volume: number;
}

class App extends Component<{}, IAppState> {
  private audioRef = React.createRef<HTMLAudioElement>();
  private napsterRef = React.createRef<NapsterComponent>();
  private spotifyRef = React.createRef<SpotifyComponent>();
  private soundCloud = new SoundCloud();
  private napster = new Napster();
  private songService = new SongService();
  private configService = new ConfigService();
  private youtube = new Youtube();

  constructor(props: any) {
    super(props);
    this.state = {
      albumResults: [],
      artistResults: [],
      doLoop: true,
      elapsed: 0,
      isPlaying: false,
      playOnStartup: true,
      playlist: [],
      playlistIndex: -1,
      search: "",
      searchType: "soundcloud",
      songResults: [],
      src: "",
      total: 0,
      volume: 1.0,
    };
  }

  public async componentDidMount() {
    const songs = await this.songService.getSongs();
    const currentSongId = await this.configService.getCurrentSongId();
    const time = await this.configService.getCurrentSongTime();
    this.setState(
      {
        playlist: songs,
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
      <li key={songInfo.id}>
        <a
          href="#"
          className={index === this.state.playlistIndex ? "Selected-Song" : ""}
          onClick={this.onPlaylistClick.bind(this, index)}
          dangerouslySetInnerHTML={{ __html: songInfo.name }}
        />
        <button onClick={this.onDeleteClick.bind(this, songInfo)}>
          Delete
        </button>
      </li>
    ));
    const songSearchList = this.state.songResults.map((song, index) => (
      <li key={index}>
        <a
          href="#"
          onClick={this.onClickSong.bind(this, song)}
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
      <div className="App">
        <div>
          <SpotifyComponent ref={this.spotifyRef} />
          <NapsterComponent ref={this.napsterRef} />
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
        <div>
          <input type="file" onChange={this.onFileChange} multiple={true} />
        </div>
        <div>
          <audio
            src={this.state.src}
            ref={this.audioRef}
            onEnded={this.onSongEnd}
            onTimeUpdate={this.onTimeUpdate}
          />
        </div>
        <Player
          isPlaying={this.state.isPlaying}
          backward={this.onPreviousClick}
          foward={this.onNextClick}
          togglePlay={this.togglePlay}
        />
        <Progress
          elapsed={this.state.elapsed}
          total={this.state.total}
          onSeek={this.onSeek}
        />
        <Volume
          volume={this.state.volume}
          onVolumeChange={this.onVolumeChange}
          onToggleMute={this.onToggleMute}
        />
        <ul>{songList}</ul>
      </div>
    );
  }

  private onSeek = (newTime: number) => {
    if (this.audioRef.current) {
      this.audioRef.current.currentTime = newTime;
    }
  };

  private onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.audioRef.current) {
      const volume = parseFloat(e.currentTarget.value);
      this.audioRef.current.volume = volume;
      this.setState({
        volume,
      });
    }
  };

  private onToggleMute = () => {
    if (this.audioRef.current) {
      let volume = 0;
      if (this.audioRef.current.muted) {
        this.audioRef.current.muted = false;
        volume = this.audioRef.current.volume;
      } else {
        this.audioRef.current.muted = true;
      }
      this.setState({
        volume,
      });
    }
  };

  private togglePlay = () => {
    if (this.audioRef.current) {
      if (this.state.isPlaying) {
        this.audioRef.current.pause();
        this.setState({
          isPlaying: false,
        });
      } else {
        this.audioRef.current.play();
        this.setState({
          isPlaying: true,
        });
      }
    }
  };

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
    this.setState({
      playlist: newPlaylist,
      playlistIndex: currentIndex,
    });
  };

  private onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ search: e.currentTarget.value });
  };

  private onSearchTypeChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ searchType: e.currentTarget.value });
  };

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
    if (this.state.searchType === "spotify") {
      if (this.spotifyRef.current) {
        const data = await this.spotifyRef.current.searchAll(this.state.search);
        songs = data.tracks;
        albums = data.albums;
        artists = data.artists;
      }
    }
    this.setState({
      albumResults: albums,
      artistResults: artists,
      songResults: songs,
    });
  };

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
    if (this.audioRef.current) {
      this.configService.setCurrentSongTime(this.audioRef.current.currentTime);
      this.setState({
        elapsed: this.audioRef.current.currentTime,
        total: this.audioRef.current.duration,
      });
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
      this.setState({
        playlist: allSongs,
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
    if (song.from === "napster") {
      if (this.napsterRef.current) {
        this.napsterRef.current.play(song.apiId || "");
      }
      return;
    }
    if (song.from === "spotify") {
      if (this.spotifyRef.current) {
        this.spotifyRef.current.play(song.apiId || "");
      }
      return;
    }
    this.setState(
      {
        currentSong: song,
        isPlaying: true,
        playlistIndex: index,
        src: source,
      },
      () => {
        this.reloadPlayer();
        if (time && this.audioRef.current) {
          this.audioRef.current.currentTime = time;
        }
      },
    );
  }

  private onPlaylistClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    this.playSong(index);
  };

  private stopPlayer() {
    if (this.audioRef.current) {
      this.audioRef.current.pause();
    }
  }

  private reloadPlayer() {
    if (this.audioRef.current) {
      this.audioRef.current.load();
      this.audioRef.current.play();
    }
  }
}

export default App;
