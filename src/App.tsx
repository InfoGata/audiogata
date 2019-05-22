import {
  createStyles,
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
import AudioComponent from "./components/Audio";
import { IPlayerComponent } from "./components/IPlayerComponent";
import NapsterComponent from "./components/Napster";
import Player from "./components/Player";
import PlayQueue from "./components/PlayQueue";
import Progress from "./components/Progress";
import Search from "./components/Search";
import SpotifyComponent from "./components/Spotify";
import Volume from "./components/Volume";
import { ConfigService } from "./services/data/config.service";
import { ISong } from "./services/data/database";
import { SongService } from "./services/data/song.service";

const drawerWidth = 240;

const styles = (theme: Theme) =>
  createStyles({
    bottomAppBar: {
      bottom: 0,
      top: "auto",
      transition: theme.transitions.create(["margin", "width"], {
        duration: theme.transitions.duration.leavingScreen,
        easing: theme.transitions.easing.sharp,
      }),
    },
    toolbar: {
      alignItems: "center",
      justifyContent: "space-between",
    },
    root: {
      display: "flex",
    },
    appBarShift: {
      marginRight: drawerWidth,
      transition: theme.transitions.create(["margin", "width"], {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeOut,
      }),
      width: `calc(100% - ${drawerWidth}px)`,
    },
    menuButton: {
      marginLeft: 12,
      marginRight: 20,
    },
    hide: {
      display: "none",
    },
    drawer: {
      flexShrink: 0,
      width: drawerWidth,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      alignItems: "center",
      display: "flex",
      padding: "0 8px",
      ...theme.mixins.toolbar,
      justifyContent: "flex-start",
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
  });

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
  playQueueOpen: boolean;
}

interface IProps extends WithStyles<typeof styles> {}

class App extends Component<IProps, IAppState> {
  private audioRef = React.createRef<AudioComponent>();
  private napsterRef = React.createRef<NapsterComponent>();
  private spotifyRef = React.createRef<SpotifyComponent>();
  private songService = new SongService();
  private configService = new ConfigService();
  private shuffleList: number[] = [];

  constructor(props: any) {
    super(props);
    this.state = {
      doLoop: true,
      elapsed: 0,
      isPlaying: false,
      muted: false,
      playOnStartup: true,
      playQueueOpen: true,
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
    const { classes } = this.props;
    const { playQueueOpen } = this.state;
    return (
      <div className={classes.root}>
        <div>
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
        </div>
        <AppBar
          position="fixed"
          color="default"
          className={classNames(classes.bottomAppBar, {
            [classes.appBarShift]: playQueueOpen,
          })}
        >
          <Toolbar className={this.props.classes.toolbar}>
            <Typography
              variant="body1"
              dangerouslySetInnerHTML={{
                __html:
                  (this.state.currentSong && this.state.currentSong.name) || "",
              }}
            />
            <Player
              isPlaying={this.state.isPlaying}
              backward={this.onPreviousClick}
              foward={this.onNextClick}
              togglePlay={this.togglePlay}
              random={this.state.random}
              toggleShuffle={this.onToggleShuffle}
              toggleRepeat={this.onToggleRepeat}
              repeat={this.state.doLoop}
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
          className={this.props.classes.drawer}
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
            songList={this.state.playlist}
            currentSong={this.state.currentSong}
            onDeleteClick={this.onDeleteClick}
            onPlaylistClick={this.onPlaylistClick}
          />
        </Drawer>
      </div>
    );
  }

  private handleDrawerOpen = () => {
    this.setState({ playQueueOpen: true });
  };

  private handleDrawerClose = () => {
    this.setState({ playQueueOpen: false });
  };

  private getPlayerComponentByName(
    name: string,
  ): React.RefObject<IPlayerComponent> {
    return this.getSpecificComponentByName(name) || this.audioRef;
  }

  private getSpecificComponentByName(
    name: string,
  ): React.RefObject<IPlayerComponent> | undefined {
    switch (name) {
      case "napster":
        return this.napsterRef;
      case "spotify":
        return this.spotifyRef;
    }
  }

  private readyCallback = async (name: string) => {
    const currentSongId = await this.configService.getCurrentSongId();
    const time = await this.configService.getCurrentSongTime();
    if (currentSongId && this.state.playOnStartup) {
      const index = this.state.playlist.findIndex(s => s.id === currentSongId);
      const song = this.state.playlist[index];
      if (song.from === name) {
        await this.playSongByIndex(index, time);
      } else if (
        name === "local-audio" &&
        !this.getSpecificComponentByName(song.from || "")
      ) {
        await this.playSongByIndex(index, time);
      }
    }
  };

  private onSeek = (newTime: number) => {
    if (this.state.currentSong && this.state.currentSong.from) {
      const player = this.getPlayerComponentByName(this.state.currentSong.from);
      if (player.current) {
        player.current.seek(newTime);
      }
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
    if (this.state.currentSong && this.state.currentSong.from) {
      const player = this.getPlayerComponentByName(this.state.currentSong.from);
      if (player.current) {
        player.current.setVolume(volume);
      }
    }
  }

  private onToggleShuffle = () => {
    this.shuffleList = [];
    this.setState(state => ({
      random: !state.random,
    }));
  };

  private onToggleRepeat = () => {
    this.setState(state => ({
      doLoop: !state.doLoop,
    }));
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

  private onClickSong = async (song: ISong, e: React.MouseEvent) => {
    e.preventDefault();
    const id = await this.songService.addSong(song);
    song.id = id;

    const currentPlaylist = [...this.state.playlist];
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

  private onPreviousClick = async () => {
    if (this.state.elapsed > 2) {
      this.onSeek(0);
      return;
    }
    let newIndex = this.state.playlistIndex - 1;
    if (newIndex >= 0) {
      await this.playSongByIndex(newIndex);
    } else if (this.state.doLoop) {
      newIndex = this.state.playlist.length - 1;
      await this.playSongByIndex(newIndex);
    }
  };

  private onNextClick = async () => {
    let newIndex = this.state.playlistIndex + 1;
    if (this.state.random) {
      if (this.shuffleList.length === 0) {
        this.createShuffleList();
      }
      newIndex = this.shuffleList.pop() || 0;
    }
    if (this.state.playlist.length > newIndex) {
      await this.playSongByIndex(newIndex);
    } else if (this.state.doLoop) {
      newIndex = 0;
      await this.playSongByIndex(newIndex);
    }
  };

  private createShuffleList() {
    const indexArray = Object.keys(this.state.playlist).map(Number);
    this.shuffleArray(indexArray);
    this.shuffleList = indexArray;
    // Whatever song is currently playing, don't put in list
    this.shuffleList = this.shuffleList.filter(
      s => s !== this.state.playlistIndex,
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
    // await this.configService.setCurrentSongTime(elapsed);
    this.setState({
      elapsed,
      total,
    });
  };

  private isNotValidIndex(index: number) {
    return this.state.playlist[index] === undefined;
  }

  private onSongError() {
    this.onNextClick();
  }

  private async playSong(song: ISong, time?: number) {
    this.pausePlayer();
    await this.configService.setCurrentSong(song);
    await this.configService.setCurrentSongTime(0);
    if (song.from) {
      const player = this.getPlayerComponentByName(song.from);
      if (player.current) {
        try {
          await player.current.play(song);
        } catch (err) {
          console.log(err);
          this.onSongError();
          return;
        }
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

  private onPlaylistClick = async (index: number) => {
    await this.playSongByIndex(index);
    this.createShuffleList();
  };

  private resumePlayer() {
    if (this.state.currentSong && this.state.currentSong.from) {
      const player = this.getPlayerComponentByName(this.state.currentSong.from);
      if (player.current) {
        player.current.resume();
      }
    }
  }

  private pausePlayer() {
    if (this.state.currentSong && this.state.currentSong.from) {
      const player = this.getPlayerComponentByName(this.state.currentSong.from);
      if (player.current) {
        player.current.pause();
      }
    }
  }
}

export default (process.env.NODE_ENV === "development"
  ? hot(withStyles(styles, { withTheme: true })(App))
  : withStyles(styles, { withTheme: true })(App));
