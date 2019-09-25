import {
  createStyles,
  CssBaseline,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import React, { Component } from "react";
import { hot } from "react-hot-loader/root";
import { connect } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bindActionCreators, Dispatch } from "redux";
import PlayerBar from "./components/PlayerBar";
import QueueBar from "./components/QueueBar";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";
import { ISong } from "./models";
import { IPlayerComponent } from "./players/IPlayerComponent";
import Local from "./players/local";
import {
  deleteTrack,
  dequeueShuffleList,
  pause,
  play,
  setElapsed,
  setShuffleList,
  setTrack,
} from "./store/reducers/songReducer";
import { AppState } from "./store/store";

const styles = (_: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
  });

interface IAppState {
  playOnStartup: boolean;
  total: number;
  volume: number;
  muted: boolean;
  isLoaded: boolean;
}

interface IProps extends WithStyles<typeof styles>, StateProps, DispatchProps {}

class App extends Component<IProps, IAppState> {
  private audioPlayer: Local;

  constructor(props: any) {
    super(props);
    this.state = {
      isLoaded: false,
      muted: false,
      playOnStartup: true,
      total: 0,
      volume: 1.0,
    };
    this.audioPlayer = new Local(this.setTrackTimes, this.onSongEnd);
  }

  public async componentDidMount() {
    this.setMediaSessionActions();
    if (this.state.playOnStartup && this.props.isPlaying) {
      this.playCurrentSong();
    }
  }

  public render() {
    const { classes } = this.props;
    return (
      <Router>
        <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
        <div className={classes.root}>
          <CssBaseline />
          <SideBar />
          <Routes />
          <PlayerBar
            onPreviousClick={this.onPreviousClick}
            onNextClick={this.onNextClick}
            togglePlay={this.togglePlay}
            onSeek={this.onSeek}
            onVolumeChange={this.onVolumeChange}
            onToggleMute={this.onToggleMute}
            isMuted={this.state.muted}
            total={this.state.total}
            isPlaying={this.props.isPlaying}
            volume={this.state.volume}
            muted={this.state.muted}
          />
          <QueueBar
            onPlaylistClick={this.onPlaylistClick}
            onDeleteClick={this.onDeleteClick}
          />
        </div>
      </Router>
    );
  }

  private async playCurrentSong() {
    const currentSong = this.props.currentSong;
    if (currentSong) {
      this.playSong(currentSong, this.props.elapsed);
    }
  }

  private getPlayerComponentByName(name: string): IPlayerComponent {
    return this.getSpecificComponentByName(name) || this.audioPlayer;
  }

  private getSpecificComponentByName(_: string): IPlayerComponent | undefined {
    return undefined;
  }

  private onSeek = (newTime: number) => {
    if (this.props.currentSong && this.props.currentSong.from) {
      const player = this.getPlayerComponentByName(this.props.currentSong.from);
      player.seek(newTime);
    }
  };

  private onVolumeChange = (
    _: React.ChangeEvent<{}>,
    volume: number | number[],
  ) => {
    const actualVolume = (volume as number) / 100;
    this.setVolume(actualVolume);
    this.setState({
      muted: false,
      volume: actualVolume,
    });
  };

  private setVolume(volume: number) {
    if (this.props.currentSong && this.props.currentSong.from) {
      const player = this.getPlayerComponentByName(this.props.currentSong.from);
      player.setVolume(volume);
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
    if (this.props.isPlaying) {
      this.pausePlayer();
      this.props.pause();
    } else {
      if (this.state.isLoaded) {
        this.resumePlayer();
      } else {
        this.playCurrentSong();
      }
      this.props.play();
    }
  };

  private onDeleteClick = async (song: ISong) => {
    if (this.props.currentSong && this.props.currentSong.id === song.id) {
      this.pausePlayer();
      this.props.setTrack(undefined);
    }

    this.props.deleteTrack(song);
  };

  private getCurrentIndex() {
    if (this.props.currentSong) {
      return this.props.songs.indexOf(this.props.currentSong);
    }
    return -1;
  }

  private async playSongByIndex(index: number, time?: number) {
    if (this.isNotValidIndex(index)) {
      return;
    }
    const song = this.props.songs[index];
    await this.playSong(song, time);
  }

  private isNotValidIndex(index: number) {
    return this.props.songs[index] === undefined;
  }

  private onPreviousClick = async () => {
    if (this.props.elapsed && this.props.elapsed > 2) {
      this.onSeek(0);
      return;
    }
    let newIndex = this.getCurrentIndex() - 1;
    if (newIndex >= 0) {
      await this.playSongByIndex(newIndex);
    } else if (this.props.repeat) {
      newIndex = this.props.songs.length - 1;
      await this.playSongByIndex(newIndex);
    }
  };

  private onNextClick = async () => {
    let newIndex = this.getCurrentIndex() + 1;
    if (this.props.shuffle) {
      if (this.props.shuffleList.length === 0) {
        this.props.setShuffleList();
      }
      newIndex = this.props.shuffleList[0] || 0;
      this.props.dequeueShuffleList();
    }
    if (this.props.songs.length > newIndex) {
      await this.playSongByIndex(newIndex);
    } else if (this.props.repeat) {
      newIndex = 0;
      await this.playSongByIndex(newIndex);
    }
  };

  private onSongEnd = () => {
    this.onNextClick();
  };

  private setTrackTimes = async (elapsed: number, total: number) => {
    this.props.setElapsed(elapsed);
    this.setState({
      total,
    });
  };

  private onSongError(err: any) {
    // NotAllowedError occurs when autoplay is denied.
    if (err.name === "NotAllowedError") {
      this.props.setElapsed(0);
      return;
    }

    if (this.props.currentSong) {
      const message = `${this.props.currentSong.name}: ${err.message}`;
      toast.error(message);
      // tslint:disable-next-line: no-console
      console.log(err);
    }

    this.onNextClick();
  }

  private async playSong(song: ISong, time?: number) {
    this.pausePlayer();
    this.props.setTrack(song);
    if (song.from) {
      const player = this.getPlayerComponentByName(song.from);
      try {
        await player.play(song);
      } catch (err) {
        this.onSongError(err);
        return;
      }
    }
    this.setMediaSessionMetaData();
    this.setState({
      isLoaded: true,
    });
    this.props.play();
    if (time) {
      this.onSeek(time);
    }
  }

  private onPlaylistClick = async (song: ISong) => {
    await this.playSong(song);
    this.props.setShuffleList();
  };

  private resumePlayer() {
    if (this.props.currentSong && this.props.currentSong.from) {
      const player = this.getPlayerComponentByName(this.props.currentSong.from);
      player.resume();
    }
  }

  private pausePlayer() {
    if (this.props.currentSong && this.props.currentSong.from) {
      const player = this.getPlayerComponentByName(this.props.currentSong.from);
      player.pause();
    }
  }

  private setMediaSessionMetaData() {
    if (navigator && navigator.mediaSession) {
      if (this.props.currentSong) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.props.currentSong.name,
        });
      }
    }
  }

  private setMediaSessionActions() {
    if (navigator && navigator.mediaSession) {
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        this.onPreviousClick();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        this.onNextClick();
      });
    }
  }
}

const mapStateToProps = (state: AppState) => ({
  currentSong: state.song.currentSong,
  elapsed: state.song.elapsed,
  isPlaying: state.song.isPlaying,
  playlists: state.playlist.playlists,
  repeat: state.song.repeat,
  shuffle: state.song.shuffle,
  shuffleList: state.song.shuffleList,
  songs: state.song.songs,
});
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      deleteTrack,
      dequeueShuffleList,
      pause,
      play,
      setElapsed,
      setShuffleList,
      setTrack,
    },
    dispatch,
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const styledComponent = withStyles(styles, { withTheme: true })(App);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(styledComponent);
export default process.env.NODE_ENV === "development"
  ? hot(connectedComponent)
  : connectedComponent;
