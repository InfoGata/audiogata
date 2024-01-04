import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { Route, Routes } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import AlbumPage from "../pages/AlbumPage";
import ArtistPage from "../pages/ArtistPage";
import Donate from "../pages/Donate";
import FavoriteAlbums from "../pages/FavoriteAlbums";
import FavoriteArtists from "../pages/FavoriteArtists";
import FavoritePlayists from "../pages/FavoritePlaylists";
import FavoriteTracks from "../pages/FavoriteTracks";
import Favorites from "../pages/Favorites";
import Home from "../pages/Home";
import Lyrics from "../pages/Lyrics";
import NowPlaying from "../pages/NowPlaying";
import PlaylistTrackInfo from "../pages/PlaylistTrackInfo";
import PlaylistTracks from "../pages/PlaylistTracks";
import Playlists from "../pages/Playlists";
import PluginDetails from "../pages/PluginDetails";
import PluginInstall from "../pages/PluginInstall";
import PluginOptions from "../pages/PluginOptions";
import PluginPlaylist from "../pages/PluginPlaylist";
import PluginPlaylists from "../pages/PluginPlaylists";
import Plugins from "../pages/Plugins";
import Privacy from "../pages/Privacy";
import QueueTrackInfo from "../pages/QueueTrackInfo";
import Search from "../pages/Search";
import Settings from "../pages/Settings";
import DrawerHeader from "../layouts/DrawerHeader";

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
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/favorites" element={<Favorites />}>
          <Route index element={<FavoriteTracks />} />
          <Route path="tracks" element={<FavoriteTracks />} />
          <Route path="albums" element={<FavoriteAlbums />} />
          <Route path="artists" element={<FavoriteArtists />} />
          <Route path="playlists" element={<FavoritePlayists />} />
        </Route>
        <Route path="/lyrics" element={<Lyrics />} />
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
