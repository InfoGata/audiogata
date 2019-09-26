import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExtensionIcon from "@material-ui/icons/Extension";
import HomeIcon from "@material-ui/icons/Home";
import MenuIcon from "@material-ui/icons/Menu";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import SettingsApplicationsIcon from "@material-ui/icons/SettingsApplications";
import SyncIcon from "@material-ui/icons/Sync";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";
import NavigationPlaylistItem from "./NavigationPlaylistItem";

const Navigation: React.FC = () => {
  const [playlistOpen, setPlaylistOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  function handlePlaylistClick() {
    setPlaylistOpen(!playlistOpen);
  }
  function openDialog() {
    setDialogOpen(true);
  }
  function closeDialog() {
    setDialogOpen(false);
  }

  const playlistItems = playlists.map(p => (
    <NavigationPlaylistItem playlist={p} key={p.id} />
  ));
  return (
    <List>
      <ListItem button={true} component={Link} to="/" key="Home">
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText>Home</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/plugins" key="Plugins">
        <ListItemIcon>
          <ExtensionIcon />
        </ListItemIcon>
        <ListItemText>Plugins</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/sync" key="Sync">
        <ListItemIcon>
          <SyncIcon />
        </ListItemIcon>
        <ListItemText>Sync</ListItemText>
      </ListItem>
      <ListItem button={true} key="Playlists" onClick={handlePlaylistClick}>
        <ListItemIcon>
          <MenuIcon />
        </ListItemIcon>
        <ListItemText>Playlists</ListItemText>
        {playlistOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={playlistOpen} timeout="auto" unmountOnExit={true}>
        <List>
          <ListItem button={true} onClick={openDialog}>
            <ListItemText primary="Add Playlist" />
            <ListItemSecondaryAction>
              <IconButton aria-label="Add" onClick={openDialog}>
                <PlaylistAddIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {playlistItems}
        </List>
        <AddPlaylistDialog handleClose={closeDialog} open={dialogOpen} />
      </Collapse>
      <ListItem button={true} component={Link} to="/settings" key="Settings">
        <ListItemIcon>
          <SettingsApplicationsIcon />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </ListItem>
    </List>
  );
};

export default React.memo(Navigation);
