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
import { useTheme } from "@mui/material/styles";
import PluginPlaylists from "./PluginPlaylists";
import PluginPlaylist from "./PluginPlaylist";
import PluginDetails from "./PluginDetails";
import PluginInstall from "./PluginInstall";
import PlaylistTrackInfo from "./PlaylistTrackInfo";
import DrawerHeader from "./DrawerHeader";
import PluginOptions from "./PluginOptions";
import ArtistPage from "./ArtistPage";
import AlbumPage from "./AlbumPage";
import AboutPage from "./AboutPage";
import Donate from "./Donate";

const Routing: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 1,
        overflow: "auto",
        minHeight: `calc(100vh - ${theme.spacing(3)})`,
      }}
    >
      <DrawerHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nowplaying" element={<NowPlaying />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/plugininstall" element={<PluginInstall />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:playlistId" element={<PlaylistTracks />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/track/:trackId" element={<QueueTrackInfo />} />
        <Route
          path="/playlists/:playlistId/tracks/:trackId"
          element={<PlaylistTrackInfo />}
        />
        <Route
          path="/plugins/:pluginId/playlists"
          element={<PluginPlaylists />}
        />
        <Route
          path="/plugins/:pluginId/playlists/:apiId"
          element={<PluginPlaylist />}
        />
        <Route
          path="/plugins/:pluginId/artists/:apiId"
          element={<ArtistPage />}
        />
        <Route
          path="/plugins/:pluginId/albums/:apiId"
          element={<AlbumPage />}
        />
        <Route path="/plugins/:pluginId" element={<PluginDetails />} />
        <Route path="/plugins/:pluginId/options" element={<PluginOptions />} />
      </Routes>
      <DrawerHeader />
    </Box>
  );
};

export default Routing;
