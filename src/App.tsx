import {
  createStyles,
  CssBaseline,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React, { Component } from "react";
import { hot } from "react-hot-loader/root";
import { connect } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bindActionCreators, Dispatch } from "redux";
import AddPlaylistDialog from "./components/AddPlaylistDialog";
import PlayerBar from "./components/PlayerBar";
import PlaylistMenuItem from "./components/PlaylistMenuItem";
import PlayQueue from "./components/PlayQueue";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";
import { ISong } from "./models";
import { IPlayerComponent } from "./players/IPlayerComponent";
import Local from "./players/local";
import {
  clearTracks,
  deleteTrack,
  setTrack,
  setTracks,
  toggleRepeat,
  toggleShuffle,
} from "./store/reducers/songReducer";
import { AppState } from "./store/store";

const drawerWidth = 300;

const styles = (theme: Theme) =>
  createStyles({
    drawer: {
      flexShrink: 0,
      width: drawerWidth,
    },
    drawerHeader: {
      alignItems: "center",
      display: "flex",
      padding: "0 8px",
      ...theme.mixins.toolbar,
      justifyContent: "flex-start",
    },
    drawerPaper: {
      width: drawerWidth,
    },
    root: {
      display: "flex",
    },
  });

interface IAppState {
  playOnStartup: boolean;
  isPlaying: boolean;
  elapsed: number;
  total: number;
  volume: number;
  muted: boolean;
  isStopped: boolean;
  anchorEl: HTMLElement | null;
  dialogOpen: boolean;
}

interface IProps extends WithStyles<typeof styles>, StateProps, DispatchProps {}

class App extends Component<IProps, IAppState> {
  private audioPlayer: Local;
  private shuffleList: number[] = [];

  constructor(props: any) {
    super(props);
    this.state = {
      anchorEl: null,
      dialogOpen: false,
      elapsed: 0,
      isPlaying: false,
      isStopped: true,
      muted: false,
      playOnStartup: true,
      total: 0,
      volume: 1.0,
    };
    this.audioPlayer = new Local(this.setTrackTimes, this.onSongEnd);
  }

  public async componentDidMount() {
    this.setMediaSessionActions();
    if (this.state.playOnStartup) {
      this.playCurrentSong();
    }
  }

  public async playCurrentSong() {
    const currentSong = this.props.currentSong;
    if (currentSong) {
      this.playSong(currentSong);
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
            onToggleShuffle={this.onToggleShuffle}
            onToggleRepeat={this.onToggleRepeat}
            onSeek={this.onSeek}
            onVolumeChange={this.onVolumeChange}
            onToggleMute={this.onToggleMute}
            isMuted={this.state.muted}
            elapsed={this.state.elapsed}
            total={this.state.total}
            isPlaying={this.state.isPlaying}
            shuffle={this.props.shuffle}
            repeat={this.props.repeat}
            volume={this.state.volume}
            muted={this.state.muted}
          />
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="right"
            open={true}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.drawerHeader}>
              <button onClick={this.openMenu}>Save</button>
              <button onClick={this.clearTracks}>Clear</button>
            </div>
            <Menu
              open={Boolean(this.state.anchorEl)}
              onClose={this.closeMenu}
              anchorEl={this.state.anchorEl}
            >
              <MenuItem onClick={this.addToNewPlaylist}>
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <ListItemText primary="Add To New Playlist" />
              </MenuItem>
              {this.props.playlists.map(p => (
                <PlaylistMenuItem
                  key={p.id}
                  playlist={p}
                  songs={this.props.songs}
                  closeMenu={this.closeMenu}
                />
              ))}
            </Menu>
            <AddPlaylistDialog
              songs={this.props.songs}
              open={this.state.dialogOpen}
              handleClose={this.closeDialog}
            />
            <Divider />
            <PlayQueue
              songList={this.props.songs}
              currentSong={this.props.currentSong}
              onDeleteClick={this.onDeleteClick}
              onPlaylistClick={this.onPlaylistClick}
              setTracks={this.setPlayQueue}
            />
          </Drawer>
        </div>
      </Router>
    );
  }

  private openDialog = () => {
    this.setState({
      dialogOpen: true,
    });
  };

  private closeDialog = () => {
    this.setState({
      dialogOpen: false,
    });
  };

  private openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  private closeMenu = () => {
    this.setState({
      anchorEl: null,
    });
  };

  private addToNewPlaylist = () => {
    this.openDialog();
    this.closeMenu();
  };

  private clearTracks = () => {
    this.props.clearTracks();
  };

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

  private onToggleShuffle = () => {
    this.shuffleList = [];
    this.props.toggleShuffle();
  };

  private onToggleRepeat = () => {
    this.props.toggleRepeat();
  };

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
      if (this.state.isStopped) {
        this.playCurrentSong();
      } else {
        this.pausePlayer();
        this.setState({
          isPlaying: false,
        });
      }
    } else {
      this.resumePlayer();
      this.setState({
        isPlaying: true,
      });
    }
  };

  private onDeleteClick = async (song: ISong) => {
    if (this.props.currentSong && this.props.currentSong.id === song.id) {
      this.pausePlayer();
      this.props.setTrack(undefined);
    }
    this.shuffleList = [];

    this.props.deleteTrack(song);
  };

  private setPlayQueue = (tracks: ISong[]) => {
    this.props.setTracks(tracks);
    this.shuffleList = [];
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
    if (this.state.elapsed > 2) {
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
      if (this.shuffleList.length === 0) {
        this.createShuffleList();
      }
      newIndex = this.shuffleList.pop() || 0;
    }
    if (this.props.songs.length > newIndex) {
      await this.playSongByIndex(newIndex);
    } else if (this.props.repeat) {
      newIndex = 0;
      await this.playSongByIndex(newIndex);
    }
  };

  private createShuffleList() {
    const indexArray = Object.keys(this.props.songs).map(Number);
    this.shuffleArray(indexArray);
    this.shuffleList = indexArray;
  }

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
    this.setState({
      elapsed,
      total,
    });
  };

  private onSongError(err: any) {
    if (this.props.currentSong) {
      const message = `${this.props.currentSong.name}: ${err.message}`;
      toast.error(message);
      // tslint:disable-next-line: no-console
      console.log(message);
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
    this.setState(
      {
        isPlaying: true,
        isStopped: false,
      },
      () => {
        if (time) {
          this.onSeek(time);
        }
      },
    );
  }

  private onPlaylistClick = async (song: ISong) => {
    await this.playSong(song);
    this.createShuffleList();
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
  playlists: state.playlist.playlists,
  repeat: state.song.repeat,
  shuffle: state.song.shuffle,
  songs: state.song.songs,
});
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      clearTracks,
      deleteTrack,
      setTrack,
      setTracks,
      toggleRepeat,
      toggleShuffle,
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
