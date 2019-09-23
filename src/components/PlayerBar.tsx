import { makeStyles, Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import clsx from "clsx";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import Controls from "./Controls";
import Progress from "./Progress";
import Volume from "./Volume";

const drawerWidth = 300;
const useStyles = makeStyles(theme => ({
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
  hide: {
    display: "none",
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  toolbar: {
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

interface IProps {
  onPreviousClick: () => void;
  onNextClick: () => void;
  togglePlay: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (newTime: number) => void;
  onVolumeChange: (
    event: React.ChangeEvent<{}>,
    volume: number | number[],
  ) => void;
  onToggleMute: () => void;
  isMuted: boolean;
  elapsed: number;
  total: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
}

const PlayerBar: React.FC<IProps> = props => {
  const classes = useStyles();
  const currentSong = useSelector((state: AppState) => state.song.currentSong);

  return (
    <AppBar
      position="fixed"
      color="default"
      className={clsx(classes.bottomAppBar, {
        [classes.appBarShift]: true,
      })}
    >
      <Toolbar className={classes.toolbar}>
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: (currentSong && currentSong.name) || "",
          }}
        />
        <Controls
          isPlaying={props.isPlaying}
          backward={props.onPreviousClick}
          foward={props.onNextClick}
          togglePlay={props.togglePlay}
          toggleShuffle={props.onToggleShuffle}
          toggleRepeat={props.onToggleRepeat}
        />
        <Progress
          elapsed={props.elapsed}
          total={props.total}
          onSeek={props.onSeek}
        />
        <Volume
          volume={props.volume}
          muted={props.muted}
          onVolumeChange={props.onVolumeChange}
          onToggleMute={props.onToggleMute}
        />
      </Toolbar>
    </AppBar>
  );
};

export default PlayerBar;
