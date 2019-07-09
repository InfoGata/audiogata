import {
  createStyles,
  CssBaseline,
  Divider,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import MenuIcon from "@material-ui/icons/Menu";
import classNames from "classnames";
import React, { Component } from "react";
import { hot } from "react-hot-loader/root";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bindActionCreators, Dispatch } from "redux";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Player from "./components/Player";
import PlayQueue from "./components/PlayQueue";
import Plugins from "./components/Plugins";
import Progress from "./components/Progress";
import Sync from "./components/Sync";
import Volume from "./components/Volume";
import { IPlayerComponent } from "./players/IPlayerComponent";
import Local from "./players/local";
import NapsterPlayer from "./players/napster";
import SpotifyPlayer from "./players/spotify";
import { ISong } from "./services/data/database";
import { setTrack, toggleRepeat, toggleShuffle } from "./store/actions/player";
import { addTrack, deleteTrack, loadTracks } from "./store/actions/song";
import { AppState } from "./store/store";

const drawerWidth = 240;

const styles = (theme: Theme) =>
  createStyles({
    appBarShift: {
      marginRight: drawerWidth,
      transition: theme.transitions.create(["margin", "width"], {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeOut,
      }),
      width: `calc(100% - ${drawerWidth}px)`,
    },
    bottomAppBar: {
      bottom: 0,
      top: "auto",
      transition: theme.transitions.create(["margin", "width"], {
        duration: theme.transitions.duration.leavingScreen,
        easing: theme.transitions.easing.sharp,
      }),
      zIndex: theme.zIndex.drawer + 1,
    },
    content: {
      flexGrow: 1,
      marginRight: -drawerWidth,
      padding: theme.spacing.unit * 3,
      transition: theme.transitions.create("margin", {
        duration: theme.transitions.duration.leavingScreen,
        easing: theme.transitions.easing.sharp,
      }),
    },
    contentShift: {
      marginRight: 0,
      transition: theme.transitions.create("margin", {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeOut,
      }),
    },
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
    hide: {
      display: "none",
    },
    menuButton: {
      marginLeft: 12,
      marginRight: 20,
    },
    root: {
      display: "flex",
    },
    toolbar: {
      alignItems: "center",
      justifyContent: "space-between",
    },
  });

interface IAppState {
  playOnStartup: boolean;
  isPlaying: boolean;
  elapsed: number;
  total: number;
  volume: number;
  muted: boolean;
  playQueueOpen: boolean;
  currentIndex: number;
}

interface IProps extends WithStyles<typeof styles>, StateProps, DispatchProps {}

class App extends Component<IProps, IAppState> {
  private audioPlayer: Local;
  private napsterPlayer: NapsterPlayer;
  private spotifyPlayer: SpotifyPlayer;
  private shuffleList: number[] = [];

  constructor(props: any) {
    super(props);
    this.state = {
      currentIndex: -1,
      elapsed: 0,
      isPlaying: false,
      muted: false,
      playOnStartup: true,
      playQueueOpen: true,
      total: 0,
      volume: 1.0,
    };
    this.audioPlayer = new Local(this.setTrackTimes, this.onSongEnd);
    this.napsterPlayer = new NapsterPlayer(this.setTrackTimes, this.onSongEnd);
    this.spotifyPlayer = new SpotifyPlayer(this.setTrackTimes, this.onSongEnd);
  }

  public async componentDidMount() {
    await this.props.loadTracks();
    const currentSong = this.props.currentSong;
    if (currentSong) {
      const index = this.props.songs.findIndex(s => s.id === currentSong.id);
      this.playSongByIndex(index);
    }
  }

  public render() {
    const { classes } = this.props;
    const { playQueueOpen } = this.state;
    return (
      <Router>
        <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
        <div className={classes.root}>
          <CssBaseline />
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left"
          >
            <Navigation />
          </Drawer>
          <div>
            <Route exact={true} path="/" component={this.homeRoute} />
            <Route path="/plugins" component={Plugins} />
            <Route path="/sync" component={Sync} />
          </div>
          <AppBar
            position="fixed"
            color="default"
            className={classNames(classes.bottomAppBar, {
              [classes.appBarShift]: playQueueOpen,
            })}
          >
            <Toolbar className={classes.toolbar}>
              <Typography
                variant="body1"
                dangerouslySetInnerHTML={{
                  __html:
                    (this.props.currentSong && this.props.currentSong.name) ||
                    "",
                }}
              />
              <Player
                isPlaying={this.state.isPlaying}
                backward={this.onPreviousClick}
                foward={this.onNextClick}
                togglePlay={this.togglePlay}
                random={this.props.shuffle}
                toggleShuffle={this.onToggleShuffle}
                toggleRepeat={this.onToggleRepeat}
                repeat={this.props.repeat}
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
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(
                  classes.menuButton,
                  playQueueOpen && classes.hide,
                )}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="right"
            open={this.state.playQueueOpen}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.drawerHeader}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronRightIcon />
              </IconButton>
            </div>
            <Divider />
            <PlayQueue
              songList={this.props.songs}
              currentSong={this.props.currentSong}
              onDeleteClick={this.onDeleteClick}
              onPlaylistClick={this.onPlaylistClick}
            />
          </Drawer>
        </div>
      </Router>
    );
  }

  private homeRoute = () => <Home onSelectSong={this.onClickSong} />;

  private handleDrawerOpen = () => {
    this.setState({ playQueueOpen: true });
  };

  private handleDrawerClose = () => {
    this.setState({ playQueueOpen: false });
  };

  private getPlayerComponentByName(name: string): IPlayerComponent {
    return this.getSpecificComponentByName(name) || this.audioPlayer;
  }

  private getSpecificComponentByName(
    name: string,
  ): IPlayerComponent | undefined {
    switch (name) {
      case "napster":
        return this.napsterPlayer;
      case "spotify":
        return this.spotifyPlayer;
    }
  }

  // private readyCallback = async (name: string) => {
  //   const currentSong = this.props.currentSong;
  //   if (currentSong && this.state.playOnStartup) {
  //     const index = this.props.songs.findIndex(s => s.id === currentSong.id);
  //     if (index === -1) {
  //       return;
  //     }

  //     const song = this.props.songs[index];
  //     if (song.from === name) {
  //       await this.playSongByIndex(index);
  //     } else if (
  //       name === "local-audio" &&
  //       !this.getSpecificComponentByName(song.from || "")
  //     ) {
  //       await this.playSongByIndex(index);
  //     }
  //   }
  // };

  private onSeek = (newTime: number) => {
    if (this.props.currentSong && this.props.currentSong.from) {
      const player = this.getPlayerComponentByName(this.props.currentSong.from);
      player.seek(newTime);
    }
  };

  private onVolumeChange = (e: React.ChangeEvent<{}>, volume: number) => {
    this.setVolume(volume);
    this.setState({
      muted: false,
      volume,
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

  private onClickSong = async (song: ISong) => {
    this.props.addTrack(song);
  };

  private onDeleteClick = async (song: ISong) => {
    if (this.props.currentSong && this.props.currentSong.id === song.id) {
      this.pausePlayer();
      this.props.setTrack(undefined);
    }
    this.shuffleList = [];

    await this.props.deleteTrack(song);
    const currentIndex = this.props.songs.findIndex(
      s => s.id === (this.props.currentSong ? this.props.currentSong.id : -1),
    );
    this.setState({
      currentIndex,
    });
  };

  private onPreviousClick = async () => {
    if (this.state.elapsed > 2) {
      this.onSeek(0);
      return;
    }
    let newIndex = this.state.currentIndex - 1;
    if (newIndex >= 0) {
      await this.playSongByIndex(newIndex);
    } else if (this.props.repeat) {
      newIndex = this.props.songs.length - 1;
      await this.playSongByIndex(newIndex);
    }
  };

  private onNextClick = async () => {
    let newIndex = this.state.currentIndex + 1;
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
    // Whatever song is currently playing, don't put in list
    this.shuffleList = this.shuffleList.filter(
      s => s !== this.state.currentIndex,
    );
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

  private isNotValidIndex(index: number) {
    return this.props.songs[index] === undefined;
  }

  private onSongError(err: any) {
    // tslint:disable-next-line: no-console
    console.log(err.message);
    this.onNextClick();
  }

  private async playSong(song: ISong, time?: number) {
    this.pausePlayer();
    if (song.from) {
      const player = this.getPlayerComponentByName(song.from);
      try {
        await player.play(song);
      } catch (err) {
        this.onSongError(err);
        return;
      }
    }
    this.props.setTrack(song);
    this.setState(
      {
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

    const song = this.props.songs[index];
    this.setState({
      currentIndex: index,
    });
    await this.playSong(song, time);
  }

  private onPlaylistClick = async (index: number) => {
    await this.playSongByIndex(index);
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
}

const mapStateToProps = (state: AppState) => ({
  currentSong: state.player.currentSong,
  repeat: state.player.repeat,
  shuffle: state.player.shuffle,
  songs: state.song.songs,
});
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      addTrack,
      deleteTrack,
      loadTracks,
      setTrack,
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
