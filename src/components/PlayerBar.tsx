import { AppBar, Grid, Toolbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { queuebarWidth } from "../utils";
import { getThumbnailImage } from "../utils";
import Controls from "./Controls";
import Progress from "./Progress";
import Volume from "./Volume";

const thumbnailSize = 60;

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
  card: {
    display: "flex",
  },
  hide: {
    display: "none",
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  nameContainer: {
    width: "10%",
  },
  noWrap: {
    textOverflow: "...",
  },
  thumbnail: {
    height: thumbnailSize,
    width: thumbnailSize,
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

  const image = getThumbnailImage(
    currentSong && currentSong.images,
    thumbnailSize,
  );

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
        <div className={classes.nameContainer}>
          <Typography
            noWrap={true}
            className={classes.noWrap}
            variant="body1"
            dangerouslySetInnerHTML={{
              __html: (currentSong && currentSong.name) || "",
            }}
          />
        </div>
        <Grid justify="center" alignItems="center" container={true}>
          <Controls />
          <Progress />
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default PlayerBar;
