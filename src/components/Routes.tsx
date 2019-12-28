import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import clsx from "clsx";
import React from "react";
import { useSelector } from "react-redux";
import { Route } from "react-router-dom";
import { AppState } from "../store/store";
import Home from "./Home";
import Playlist from "./Playlist";
import Playlists from "./Playlists";
import Plugins from "./Plugins";
import Settings from "./Settings";
import Sync from "./Sync";
import NowPlaying from "./NowPlaying";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    contentShift: {
      marginLeft: 0,
      transition: theme.transitions.create("margin", {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeOut,
      }),
    },
    drawerHeader: {
      alignItems: "center",
      display: "flex",
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: "flex-end",
    },
  }),
);

const Routes: React.FC = () => {
  const classes = useStyles();
  const navbarOpen = useSelector((state: AppState) => state.ui.navbarOpen);
  return (
    <main
      className={clsx(classes.content, {
        [classes.contentShift]: navbarOpen,
      })}
    >
      <div className={classes.drawerHeader} />
      <Route exact={true} path="/" component={Home} />
      <Route path="/nowplaying" component={NowPlaying} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/sync" component={Sync} />
      <Route exact={true} path="/playlists" component={Playlists} />
      <Route path="/playlists/:id" component={Playlist} />
      <Route path="/settings" component={Settings} />
    </main>
  );
};

export default Routes;
