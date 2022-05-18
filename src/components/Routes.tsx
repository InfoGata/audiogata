import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import NowPlaying from "./NowPlaying";
import Playlist from "./Playlist";
import Playlists from "./Playlists";
import Plugins from "./Plugins";
import Search from "./Search";
import Settings from "./Settings";
import QueueTrackInfo from "./QueueTrackInfo";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import PluginPlaylists from "./PluginPlaylists";
import PluginPlaylist from "./PluginPlaylist";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Routing: React.FC = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 1, overflow: "auto" }}>
      <DrawerHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nowplaying" element={<NowPlaying />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<Playlist />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/plugins/:id/playlists" element={<PluginPlaylists />} />
        <Route
          path="/plugins/:pluginid/playlists/:id"
          element={<PluginPlaylist />}
        />
        <Route path="/track/:id" element={<QueueTrackInfo />} />
      </Routes>
      <DrawerHeader />
    </Box>
  );
};

export default Routing;
