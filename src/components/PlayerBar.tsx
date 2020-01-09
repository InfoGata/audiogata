import { AppBar, Grid, Toolbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { getThumbnailImage } from "../utils";
import Controls from "./Controls";
import Progress from "./Progress";

const thumbnailSize = 75;

const useStyles = makeStyles(theme => ({
  bottomAppBar: {
    bottom: 0,
    top: "auto",
    transition: theme.transitions.create(["margin", "width"], {
      duration: theme.transitions.duration.leavingScreen,
      easing: theme.transitions.easing.sharp,
    }),
    zIndex: theme.zIndex.drawer + 3,
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
    width: "250px",
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

  const image = getThumbnailImage(
    currentSong && currentSong.images,
    thumbnailSize,
  );

  return (
    <AppBar position="fixed" color="default" className={classes.bottomAppBar}>
      <Toolbar className={classes.toolbar} disableGutters={true}>
        <Grid container={true} spacing={1}>
          <Grid item={true} spacing={0}>
            <img className={classes.thumbnail} alt="thumbnail" src={image} />
          </Grid>
          <Grid
            xs={9}
            item={true}
            container={true}
            direction="column"
            alignItems="center"
          >
            <Grid item={true}>
              <Typography
                noWrap={true}
                className={classes.noWrap}
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: (currentSong && currentSong.name) || "",
                }}
              />
            </Grid>
            <Grid item={true}>
              <Controls />
            </Grid>
            <Progress />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default PlayerBar;
