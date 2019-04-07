import React, { Component } from "react";
import "./App.css";
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
  src: string;
  playlist: ISong[];
  playlistIndex: number;
  doLoop: boolean;
  playOnStartup: boolean;
  currentSong?: ISong;
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
  private songService = new SongService();
  private configService = new ConfigService();
  private youtube = new Youtube();

  constructor(props: any) {
    super(props);
    this.state = {
      doLoop: true,
      elapsed: 0,
      isPlaying: false,
      playOnStartup: true,
      playlist: [],
      playlistIndex: -1,
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
    return (
      <div className="App">
        <SpotifyComponent ref={this.spotifyRef} />
        <NapsterComponent ref={this.napsterRef} />
        <Search onSelectSong={this.onClickSong} />
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
