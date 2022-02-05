import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Extension,
  Home,
  Menu,
  PlaylistAdd,
  PlaylistPlay,
  SettingsApplications,
  Sync,
} from "@mui/icons-material";
import React from "react";
import { Link } from "react-router-dom";
import AddPlaylistDialog from "./AddPlaylistDialog";
import NavigationPlaylistItem from "./NavigationPlaylistItem";
import { useAppSelector } from "../store/hooks";

const Navigation: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const navbarOpen = useAppSelector((state) => state.ui.navbarOpen);

  const openDialog = () => {
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
  };

  const playlistItems = playlists.map((p) => (
    <NavigationPlaylistItem playlist={p} key={p.id} />
  ));
  return (
    <List>
      <ListItem button={true} component={Link} to="/" key="Home">
        <ListItemIcon>
          <Home />
        </ListItemIcon>
        <ListItemText>Home</ListItemText>
      </ListItem>
      <ListItem
        button={true}
        component={Link}
        to="/nowplaying"
        key="Now Playing"
      >
        <ListItemIcon>
          <PlaylistPlay />
        </ListItemIcon>
        <ListItemText>Now Playing</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/plugins" key="Plugins">
        <ListItemIcon>
          <Extension />
        </ListItemIcon>
        <ListItemText>Plugins</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/sync" key="Sync">
        <ListItemIcon>
          <Sync />
        </ListItemIcon>
        <ListItemText>Sync</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/settings" key="Settings">
        <ListItemIcon>
          <SettingsApplications />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </ListItem>
      <ListItem button={true} key="AddPlaylist" onClick={openDialog}>
        <ListItemIcon>
          <PlaylistAdd />
        </ListItemIcon>
        <ListItemText>Add Playlist</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/playlists" key="Playlists">
        <ListItemIcon>
          <Menu />
        </ListItemIcon>
        <ListItemText>Playlists</ListItemText>
      </ListItem>
      {navbarOpen ? playlistItems : null}
      <AddPlaylistDialog handleClose={closeDialog} open={dialogOpen} />
    </List>
  );
};

export default React.memo(Navigation);
