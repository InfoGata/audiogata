import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import NowPlaying from "./NowPlaying";
import PlaylistTracks from "./PlaylistTracks";
import Playlists from "./Playlists";
import Plugins from "./Plugins";
import Search from "./Search";
import Settings from "./Settings";
import QueueTrackInfo from "./QueueTrackInfo";
import { Box } from "@mui/material";
import PluginPlaylists from "./PluginPlaylists";
import PluginPlaylist from "./PluginPlaylist";
import PluginDetails from "./PluginDetails";
import PlaylistTrackInfo from "./PlaylistTrackInfo";
import DrawerHeader from "./DrawerHeader";
import PluginOptions from "./PluginOptions";
import ArtistPage from "./ArtistPage";
import AlbumPage from "./AlbumPage";

const Routing: React.FC = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 1, overflow: "auto" }}>
      <DrawerHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nowplaying" element={<NowPlaying />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<PlaylistTracks />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/plugins/:id/playlists" element={<PluginPlaylists />} />
        <Route
          path="/plugins/:pluginid/playlists/:id"
          element={<PluginPlaylist />}
        />
        <Route path="/plugins/:pluginid/artists/:id" element={<ArtistPage />} />
        <Route path="/plugins/:pluginid/albums/:id" element={<AlbumPage />} />
        <Route path="/track/:id" element={<QueueTrackInfo />} />
        <Route
          path="/playlists/:playlistid/tracks/:id"
          element={<PlaylistTrackInfo />}
        />
        <Route path="/plugins/:id" element={<PluginDetails />} />
        <Route path="/plugins/:id/options" element={<PluginOptions />} />
      </Routes>
      <DrawerHeader />
    </Box>
  );
};

export default Routing;
