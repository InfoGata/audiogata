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
    </Box>
  );
};

export default Routes;
