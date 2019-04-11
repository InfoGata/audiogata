import React, { Component } from "react";
import "./App.css";
import AudioComponent from "./components/Audio";
import NapsterComponent from "./components/Napster";
import Player from "./components/Player";
import Progress from "./components/Progress";
import Search from "./components/Search";
import SpotifyComponent from "./components/Spotify";
import Volume from "./components/Volume";
import SoundCloud from "./services/apis/SoundCloud";
import Youtube from "./services/apis/Youtube";
import { ConfigService } from "./services/data/config.service";
import { ISong } from "./services/data/database";
import { SongService } from "./services/data/song.service";

interface IAppState {
  playlist: ISong[];
  playlistIndex: number;
  doLoop: boolean;
  playOnStartup: boolean;
  currentSong?: ISong;
  isPlaying: boolean;
  elapsed: number;
  total: number;
  volume: number;
  muted: boolean;
  random: boolean;
}

class App extends Component<{}, IAppState> {
  private audioRef = React.createRef<AudioComponent>();
  private napsterRef = React.createRef<NapsterComponent>();
  private spotifyRef = React.createRef<SpotifyComponent>();
  private soundCloud = new SoundCloud();
  private songService = new SongService();
  private configService = new ConfigService();
  private youtube = new Youtube();
  private shuffleList: number[] = [];

  constructor(props: any) {
    super(props);
    this.state = {
      doLoop: true,
      elapsed: 0,
      isPlaying: false,
      muted: false,
      playOnStartup: true,
      playlist: [],
      playlistIndex: -1,
      random: true,
      total: 0,
      volume: 1.0,
    };
  }

  public async componentDidMount() {
    const songs = await this.songService.getSongs();
    this.setState({
      playlist: songs,
    });
  }

  public render() {
    const songList = this.state.playlist.map((songInfo, index) => (
      <li key={songInfo.id}>
        <a
          href="#"
          className={
            this.state.currentSong && this.state.currentSong.id === songInfo.id
              ? "Selected-Song"
              : ""
          }
          onClick={this.onPlaylistClick.bind(this, index)}
          dangerouslySetInnerHTML={{ __html: songInfo.name }}
        />
        <button onClick={this.onDeleteClick.bind(this, songInfo)}>
          Delete
        </button>
      </li>
    ));
    return (
      <div className="App">
        <SpotifyComponent
          setTime={this.setTrackTimes}
          onSongEnd={this.onSongEnd}
          ref={this.spotifyRef}
          onReady={this.readyCallback}
        />
        <NapsterComponent
          onReady={this.readyCallback}
          setTime={this.setTrackTimes}
          onSongEnd={this.onSongEnd}
          ref={this.napsterRef}
        />
        <AudioComponent
          setTime={this.setTrackTimes}
          onSongEnd={this.onSongEnd}
          onReady={this.readyCallback}
          ref={this.audioRef}
        />
        <Search onSelectSong={this.onClickSong} />
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
          muted={this.state.muted}
          onVolumeChange={this.onVolumeChange}
          onToggleMute={this.onToggleMute}
        />
        <ul>{songList}</ul>
      </div>
    );
  }

  private readyCallback = async () => {
    const currentSongId = await this.configService.getCurrentSongId();
    const time = await this.configService.getCurrentSongTime();
    if (currentSongId && this.state.playOnStartup) {
      const index = this.state.playlist.findIndex(s => s.id === currentSongId);
      const song = this.state.playlist[index];
      if (song.from === "napster") {
        this.playSongByIndex(index);
      } else if (song.from === "spotify") {
        this.playSongByIndex(index);
      } else {
        this.playSongByIndex(index, time);
      }
    }
  };

  private onSeek = (newTime: number) => {
    if (
      this.state.currentSong &&
      this.state.currentSong.from === "napster" &&
      this.napsterRef.current
    ) {
      this.napsterRef.current.seek(newTime);
    } else if (
      this.state.currentSong &&
      this.state.currentSong.from === "spotify" &&
      this.spotifyRef.current
    ) {
      this.spotifyRef.current.seek(newTime);
      return;
    } else if (this.audioRef.current) {
      this.audioRef.current.seek(newTime);
    }
  };

  private onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.currentTarget.value);
    this.setVolume(volume);
    this.setState({
      muted: false,
      volume,
    });
  };

  private setVolume(volume: number) {
    if (
      this.state.currentSong &&
      this.state.currentSong.from === "napster" &&
      this.napsterRef.current
    ) {
      this.napsterRef.current.setVolume(volume);
    } else if (
      this.state.currentSong &&
      this.state.currentSong.from === "spotify" &&
      this.spotifyRef.current
    ) {
      this.spotifyRef.current.setVolume(volume);
    } else if (this.audioRef.current) {
      this.audioRef.current.setVolume(volume);
    }
  }

  private onToggleMute = () => {
    if (this.state.muted) {
      this.setVolume(this.state.volume);
      this.setState({
        muted: false,
      });
    } else {
      this.setVolume(0);
      this.setState({
        muted: true,
      });
    }
  };

  private togglePlay = () => {
    if (this.state.isPlaying) {
      this.pausePlayer();
      this.setState({
        isPlaying: false,
      });
    } else {
      this.resumePlayer();
      this.setState({
        isPlaying: true,
      });
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

  private onDeleteClick = async (song: ISong) => {
    await this.songService.deleteSong(song);
    if (this.state.currentSong && this.state.currentSong.id === song.id) {
      this.pausePlayer();
      await this.configService.setCurrentSongTime(0);
    }
    this.shuffleList = [];
    const newPlaylist = this.state.playlist.filter(s => s.id !== song.id);
    const currentIndex = newPlaylist.findIndex(
      s => s.id === (this.state.currentSong ? this.state.currentSong.id : -1),
    );
    this.setState({
      playlist: newPlaylist,
      playlistIndex: currentIndex,
    });
  };

  private onPreviousClick = () => {
    if (this.state.elapsed > 2) {
      this.onSeek(0);
      return;
    }
    let newIndex = this.state.playlistIndex - 1;
    if (newIndex >= 0) {
      this.playSongByIndex(newIndex);
    } else if (this.state.doLoop) {
      newIndex = this.state.playlist.length - 1;
      this.playSongByIndex(newIndex);
    }
  };

  private onNextClick = () => {
    let newIndex = this.state.playlistIndex + 1;
    if (this.state.random) {
      if (this.shuffleList.length === 0) {
        const indexArray = Object.keys(this.state.playlist).map(Number);
        this.shuffleArray(indexArray);
        this.shuffleList = indexArray;
      }
      newIndex = this.shuffleList.pop() || 0;
    }
    if (this.state.playlist.length > newIndex) {
      this.playSongByIndex(newIndex);
    } else if (this.state.doLoop) {
      newIndex = 0;
      this.playSongByIndex(newIndex);
    }
  };

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private onSongEnd = () => {
    this.onNextClick();
  };

  private setTrackTimes = async (elapsed: number, total: number) => {
    await this.configService.setCurrentSongTime(elapsed);
    this.setState({
      elapsed,
      total,
    });
  };

  private isNotValidIndex(index: number) {
    return this.state.playlist[index] === undefined;
  }

  private async playSong(song: ISong, time?: number) {
    this.pausePlayer();
    await this.configService.setCurrentSong(song);
    if (song.useBlob) {
      const source = URL.createObjectURL(song.blob);
      this.playLocalTrack(source);
    }
    if (song.from === "soundcloud") {
      const source = this.soundCloud.getTrackUrl(song);
      this.playLocalTrack(source);
    }
    if (song.from === "youtube") {
      const source = await this.youtube.getTrackUrl(song);
      this.playLocalTrack(source);
    }
    if (song.from === "napster") {
      if (this.napsterRef.current) {
        this.napsterRef.current.play(song.apiId || "");
      }
    }
    if (song.from === "spotify") {
      if (this.spotifyRef.current) {
        this.spotifyRef.current.play(song.apiId || "");
      }
    }
    this.setState(
      {
        currentSong: song,
        isPlaying: true,
      },
      () => {
        if (time) {
          this.onSeek(time);
        }
      },
    );
  }

  private async playSongByIndex(index: number, time?: number) {
    if (this.isNotValidIndex(index)) {
      return;
    }

    const song = this.state.playlist[index];
    this.playSong(song, time);
    this.setState({
      playlistIndex: index,
    });
  }

  private playLocalTrack(src: string) {
    if (this.audioRef.current) {
      this.audioRef.current.play(src);
    }
  }

  private onPlaylistClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    this.playSongByIndex(index);
  };

  private resumePlayer() {
    if (
      this.state.currentSong &&
      this.state.currentSong.from === "napster" &&
      this.napsterRef.current
    ) {
      this.napsterRef.current.resume();
    } else if (
      this.state.currentSong &&
      this.state.currentSong.from === "spotify" &&
      this.spotifyRef.current
    ) {
      this.spotifyRef.current.resume();
    } else if (this.audioRef.current) {
      this.audioRef.current.resume();
    }
  }

  private pausePlayer() {
    if (
      this.state.currentSong &&
      this.state.currentSong.from === "napster" &&
      this.napsterRef.current
    ) {
      this.napsterRef.current.pause();
    } else if (
      this.state.currentSong &&
      this.state.currentSong.from === "spotify" &&
      this.spotifyRef.current
    ) {
      this.spotifyRef.current.pause();
    } else if (this.audioRef.current) {
      this.audioRef.current.pause();
    }
  }
}

export default App;
