import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  Extension,
  Home,
  Info,
  Menu,
  PlaylistAdd,
  PlaylistPlay,
  SettingsApplications,
} from "@mui/icons-material";
import React from "react";
import { Link } from "react-router-dom";
import AddPlaylistDialog from "./AddPlaylistDialog";
import NavigationPlaylistItem from "./NavigationPlaylistItem";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "react-i18next";

const Navigation: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const navbarOpen = useAppSelector((state) => state.ui.navbarOpen);
  const { t } = useTranslation();

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
          <Tooltip title={t("home")} placement="right">
            <Home />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{t("home")}</ListItemText>
      </ListItem>
      <ListItem
        button={true}
        component={Link}
        to="/nowplaying"
        key="Now Playing"
      >
        <ListItemIcon>
          <Tooltip title={t("playQueue")} placement="right">
            <PlaylistPlay />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{t("playQueue")}</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/plugins" key="Plugins">
        <ListItemIcon>
          <Tooltip title={t("plugins")} placement="right">
            <Extension />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{t("plugins")}</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/settings" key="Settings">
        <ListItemIcon>
          <Tooltip title={t("settings")} placement="right">
            <SettingsApplications />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{t("settings")}</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/about" key="About">
        <ListItemIcon>
          <Tooltip title={t("about")} placement="right">
            <Info />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{t("about")}</ListItemText>
      </ListItem>
      <ListItem button={true} key="AddPlaylist" onClick={openDialog}>
        <ListItemIcon>
          <Tooltip title={t("addPlaylist")} placement="right">
            <PlaylistAdd />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{t("addPlaylist")}</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/playlists" key="Playlists">
        <ListItemIcon>
          <Tooltip title={t("playlists")} placement="right">
            <Menu />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{t("playlists")}</ListItemText>
      </ListItem>
      {navbarOpen ? playlistItems : null}
      <AddPlaylistDialog handleClose={closeDialog} open={dialogOpen} />
    </List>
  );
};

export default React.memo(Navigation);
