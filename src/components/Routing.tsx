import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { Route, Routes } from "react-router-dom";
import AboutPage from "./AboutPage";
import AlbumPage from "./AlbumPage";
import ArtistPage from "./ArtistPage";
import Donate from "./Donate";
import DrawerHeader from "./DrawerHeader";
import FavoriteAlbums from "./FavoriteAlbums";
import FavoriteArtists from "./FavoriteArtists";
import FavoritePlayists from "./FavoritePlaylists";
import FavoriteTracks from "./FavoriteTracks";
import Favorites from "./Favorites";
import Home from "./Home";
import NowPlaying from "./NowPlaying";
import PlaylistTrackInfo from "./PlaylistTrackInfo";
import PlaylistTracks from "./PlaylistTracks";
import Playlists from "./Playlists";
import PluginDetails from "./PluginDetails";
import PluginInstall from "./PluginInstall";
import PluginOptions from "./PluginOptions";
import PluginPlaylist from "./PluginPlaylist";
import PluginPlaylists from "./PluginPlaylists";
import Plugins from "./Plugins";
import Privacy from "./Privacy";
import QueueTrackInfo from "./QueueTrackInfo";
import Search from "./Search";
import Settings from "./Settings";
import Lyrics from "./Lyrics";

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
