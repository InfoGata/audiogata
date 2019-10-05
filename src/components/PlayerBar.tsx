import { Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import clsx from "clsx";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import thumbnail from "../thumbnail.png";
import { queuebarWidth } from "../utils";
import Controls from "./Controls";
import Progress from "./Progress";
import Volume from "./Volume";

const useStyles = makeStyles(theme => ({
  appBarShift: {
    marginRight: queuebarWidth,
    transition: theme.transitions.create(["margin", "width"], {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.easeOut,
    }),
    width: `calc(100% - ${queuebarWidth}px)`,
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
  thumbnail: {
    height: 75,
    width: 75,
  },
  toolbar: {
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

const PlayerBar: React.FC = () => {
  const classes = useStyles();
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const queuebarOpen = useSelector((state: AppState) => state.ui.queuebarOpen);
  const image =
    currentSong && currentSong.images && currentSong.images.length > 0
      ? currentSong.images[0].url
      : thumbnail;

  return (
    <AppBar
      position="fixed"
      color="default"
      className={clsx(classes.bottomAppBar, {
        [classes.appBarShift]: queuebarOpen,
      })}
    >
      <Toolbar className={classes.toolbar} disableGutters={true}>
        <img className={classes.thumbnail} alt="thumbnail" src={image} />
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: (currentSong && currentSong.name) || "",
          }}
        />
        <Controls />
        <Progress />
        <Volume />
      </Toolbar>
    </AppBar>
  );
};

export default PlayerBar;
