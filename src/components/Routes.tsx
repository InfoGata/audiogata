import React from "react";
import { useSelector } from "react-redux";
import { Route } from "react-router-dom";
import { AppState } from "../store/store";
import Home from "./Home";
import NowPlaying from "./NowPlaying";
import Playlist from "./Playlist";
import Playlists from "./Playlists";
import Plugins from "./Plugins";
import Search from "./Search";
import Settings from "./Settings";
import Sync from "./Sync";
import QueueTrackInfo from "./QueueTrackInfo";
import { makeStyles } from "tss-react/mui";
import { styled } from "@mui/material/styles";

const useStyles = makeStyles()((theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(1),
    width: "100%",
  },
  contentShift: {
    marginLeft: 0,
    transition: theme.transitions.create("margin", {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.easeOut,
    }),
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Routes: React.FC = () => {
  const { classes, cx } = useStyles();
  const navbarOpen = useSelector((state: AppState) => state.ui.navbarOpen);
  return (
    <main
      className={cx(classes.content, {
        [classes.contentShift]: navbarOpen,
      })}
    >
      <DrawerHeader />
      <Route exact={true} path="/" component={Home} />
      <Route path="/nowplaying" component={NowPlaying} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/sync" component={Sync} />
      <Route exact={true} path="/playlists" component={Playlists} />
      <Route path="/playlists/:id" component={Playlist} />
      <Route path="/settings" component={Settings} />
      <Route path="/search" component={Search} />
      <Route path="/track/:id" component={QueueTrackInfo} />
      <DrawerHeader />
    </main>
  );
};

export default Routes;
