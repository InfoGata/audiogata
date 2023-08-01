import { Delete, MoreHoriz } from "@mui/icons-material";
import {
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PluginFrameContainer } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { Playlist, PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addPlaylist, deletePlaylist } from "../store/reducers/playlistReducer";
import { filterAsync } from "../utils";
import ImportDialog from "./ImportDialog";

interface PlaylistsItemProps {
  playlist: PlaylistInfo;
  openMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    playlist: PlaylistInfo
  ) => void;
}

const PlaylistsItem: React.FC<PlaylistsItemProps> = (props) => {
  const { openMenu, playlist } = props;
  const playlistPath = `/playlists/${props.playlist.id}`;
  const openPlaylistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, playlist);
  };
  return (
    <ListItem disablePadding>
      <ListItemButton component={Link} to={playlistPath}>
        <ListItemText>{playlist.name}</ListItemText>
        <ListItemSecondaryAction>
          <IconButton onClick={openPlaylistMenu} size="large">
            <MoreHoriz />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItemButton>
    </ListItem>
  );
};

const Playlists: React.FC = () => {
  const { t } = useTranslation();
  const { plugins } = usePlugins();
  const { enqueueSnackbar } = useSnackbar();
  const [playlistPlugins, setPlaylistPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuPlaylist, setMenuPlaylist] = React.useState<
    PlaylistInfo | undefined
  >();
  const [openImportDialog, setOpenImportDialog] = React.useState(false);
  const onOpenImportDialog = () => setOpenImportDialog(true);
  const onCloseImportDialog = () => setOpenImportDialog(false);

  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p) =>
          (await p.hasDefined.onGetUserPlaylists()) &&
          (await p.hasDefined.onGetPlaylistTracks())
      );
      setPlaylistPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);
  const closeMenu = () => setAnchorEl(null);
  const dispatch = useAppDispatch();
  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    playlist: PlaylistInfo
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuPlaylist(playlist);
  };
  const deleteClick = () => {
    if (menuPlaylist) {
      dispatch(deletePlaylist(menuPlaylist));
    }
    closeMenu();
  };

  const pluginPlaylists = playlistPlugins.map((p) => (
    <Button
      component={Link}
      to={`/plugins/${p.id}/playlists?isuserplaylist`}
      key={p.id}
    >
      {p.name}
    </Button>
  ));

  const onImport = (item: Playlist | Track[]) => {
    if ("tracks" in item) {
      dispatch(addPlaylist(item));
      enqueueSnackbar(t("playlistImported", { playlistName: item.name }));
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("playlists")}
      </Typography>
      <Button variant="contained" onClick={onOpenImportDialog}>
        {t("importPlaylistByUrl")}
      </Button>
      <Grid>{pluginPlaylists}</Grid>
      <List>
        {playlists.map((p) => (
          <PlaylistsItem key={p.id} playlist={p} openMenu={openMenu} />
        ))}
      </List>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={deleteClick}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary={t("delete")} />
        </MenuItem>
      </Menu>
      <ImportDialog
        open={openImportDialog}
        handleClose={onCloseImportDialog}
        parseType="playlist"
        onSuccess={onImport}
      />
    </>
  );
};

export default Playlists;
