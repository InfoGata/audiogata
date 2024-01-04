import {
  Extension,
  Home,
  Info,
  Menu,
  PlaylistAdd,
  PlaylistPlay,
  Settings,
  Star,
} from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../store/hooks";
import { NavigationLinkItem } from "../types";
import AddPlaylistDialog from "../components/AddPlaylistDialog";
import NavigationLink from "./NavigationLink";
import NavigationPlaylistItem from "./NavigationPlaylistItem";

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

  const listItems: NavigationLinkItem[] = [
    { title: t("home"), link: "/", icon: <Home /> },
    { title: t("playQueue"), link: "/nowplaying", icon: <PlaylistPlay /> },
    { title: t("plugins"), link: "/plugins", icon: <Extension /> },
    { title: t("settings"), link: "/settings", icon: <Settings /> },
    { title: t("about"), link: "/about", icon: <Info /> },
    { title: t("favorites"), link: "/favorites/tracks", icon: <Star /> },
    { title: t("playlists"), link: "/playlists", icon: <Menu /> },
  ];

  return (
    <List>
      {listItems.map((l) => (
        <NavigationLink key={l.title} item={l} />
      ))}
      <ListItem disablePadding>
        <ListItemButton onClick={openDialog}>
          <ListItemIcon>
            <Tooltip title={t("addPlaylist")} placement="right">
              <PlaylistAdd />
            </Tooltip>
          </ListItemIcon>
          <ListItemText>{t("addPlaylist")}</ListItemText>
        </ListItemButton>
      </ListItem>
      {navbarOpen ? playlistItems : null}
      <AddPlaylistDialog handleClose={closeDialog} open={dialogOpen} />
    </List>
  );
};

export default React.memo(Navigation);
