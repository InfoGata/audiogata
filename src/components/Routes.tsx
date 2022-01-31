import React from "react";
import { Route } from "react-router-dom";
import Home from "./Home";
import NowPlaying from "./NowPlaying";
import Playlist from "./Playlist";
import Playlists from "./Playlists";
import Plugins from "./Plugins";
import Search from "./Search";
import Settings from "./Settings";
import Sync from "./Sync";
import QueueTrackInfo from "./QueueTrackInfo";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Routes: React.FC = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <DrawerHeader />
      <Route exact={true} path="/">
        <Home />
      </Route>
      <Route path="/nowplaying">
        <NowPlaying />
      </Route>
      <Route path="/plugins">
        <Plugins />
      </Route>
      <Route path="/sync">
        <Sync />
      </Route>
      <Route exact={true} path="/playlists">
        <Playlists />
      </Route>
      <Route path="/playlists/:id">
        <Playlist />
      </Route>
      <Route path="/settings">
        <Settings />
      </Route>
      <Route path="/search">
        <Search />
      </Route>
      <Route path="/track/:id">
        <QueueTrackInfo />
      </Route>
      <DrawerHeader />
    </Box>
  );
};

export default Routes;
