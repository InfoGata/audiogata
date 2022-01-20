import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Typography
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { IPlaylist } from "../models";
import { AppState, AppDispatch } from "../store/store";
import { Link } from "react-router-dom";
import { Delete, MoreHoriz } from "@mui/icons-material";
import { deletePlaylist } from "../store/reducers/playlistReducer";
import { useDispatch } from "react-redux";

interface IPlaylistsItemProps {
  playlist: IPlaylist;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, playlist: IPlaylist) => void;
}

const PlaylistsItem: React.FC<IPlaylistsItemProps> = props => {
  const { openMenu, playlist } = props;
  const playlistPath = `/playlists/${props.playlist.id}`;
  const openPlaylistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, playlist);
  }
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
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuPlaylist, setMenuPlaylist] = React.useState<IPlaylist>({} as IPlaylist);
  const closeMenu = () => setAnchorEl(null);
  const dispatch = useDispatch<AppDispatch>();
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, playlist: IPlaylist) => {
    setAnchorEl(event.currentTarget);
    setMenuPlaylist(playlist);
  };
  const deleteClick = () => {
    dispatch(deletePlaylist(menuPlaylist));
    closeMenu();
  };
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Playlists
      </Typography>
      <List>
        {playlists.map(p => (
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
