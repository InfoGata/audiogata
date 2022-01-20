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
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";
import NavigationPlaylistItem from "./NavigationPlaylistItem";

const Navigation: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const navbarOpen = useSelector((state: AppState) => state.ui.navbarOpen);

  const openDialog = () => {
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
  };

  const playlistItems = playlists.map(p => (
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
