import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import React from "react";
import { IPlaylist } from "../types";
import { Link } from "react-router-dom";
import { Delete, MoreHoriz } from "@mui/icons-material";
import { deletePlaylist } from "../store/reducers/playlistReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import { filterAsync } from "../utils";

interface IPlaylistsItemProps {
  playlist: IPlaylist;
  openMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    playlist: IPlaylist
  ) => void;
}

const PlaylistsItem: React.FC<IPlaylistsItemProps> = (props) => {
  const { openMenu, playlist } = props;
  const playlistPath = `/playlists/${props.playlist.id}`;
  const openPlaylistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, playlist);
  };
  return (
    <ListItem button={true} component={Link} to={playlistPath}>
      <ListItemText>{props.playlist.name}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton onClick={openPlaylistMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const Playlists: React.FC = () => {
  const { plugins } = usePlugins();
  const [playlistPlugins, setPlaylistPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuPlaylist, setMenuPlaylist] = React.useState<IPlaylist>(
    {} as IPlaylist
  );

  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p) =>
          (await p.hasDefined.getUserPlaylists()) &&
          (await p.hasDefined.getPlaylistTracks())
      );
      setPlaylistPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);
  const closeMenu = () => setAnchorEl(null);
  const dispatch = useAppDispatch();
  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    playlist: IPlaylist
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuPlaylist(playlist);
  };
  const deleteClick = () => {
    dispatch(deletePlaylist(menuPlaylist));
    closeMenu();
  };

  const pluginPlaylists = playlistPlugins.map((p) => (
    <Button component={Link} to={`/plugins/${p.id}/playlists`} key={p.id}>
      {p.name}
    </Button>
  ));
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Playlists
      </Typography>
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
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default Playlists;
