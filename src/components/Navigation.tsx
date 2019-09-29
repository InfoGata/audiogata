import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import {
  ExpandLess,
  ExpandMore,
  Extension,
  Home,
  Menu,
  PlaylistAdd,
  SettingsApplications,
  Sync,
} from "@material-ui/icons";
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

  const handlePlaylistClick = () => {
    setPlaylistOpen(!playlistOpen);
  };
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
      <ListItem button={true} key="Playlists" onClick={handlePlaylistClick}>
        <ListItemIcon>
          <Menu />
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
                <PlaylistAdd />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {playlistItems}
        </List>
        <AddPlaylistDialog handleClose={closeDialog} open={dialogOpen} />
      </Collapse>
      <ListItem button={true} component={Link} to="/settings" key="Settings">
        <ListItemIcon>
          <SettingsApplications />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </ListItem>
    </List>
  );
};

export default React.memo(Navigation);
