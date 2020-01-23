import {
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { Delete, MoreHoriz, PlaylistAdd } from "@material-ui/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { deleteTrack, setTrack } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";

interface IProps {
  song: ISong;
  style: object;
}

const QueueItem: React.FC<IProps> = props => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const dispatch = useDispatch<AppDispatch>();

  const playListClick = () => dispatch(setTrack(props.song));
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);
  const deleteClick = () => {
    dispatch(deleteTrack(props.song));
    closeMenu();
  };
  const addToNewPlaylist = () => {
    openDialog();
    closeMenu();
  };

  return (
    <>
      <ListItem
        button={true}
        key={props.song.id}
        ContainerProps={{ style: props.style }}
        selected={currentSong && currentSong.id === props.song.id}
        onClick={playListClick}
        ContainerComponent="div"
      >
        <ListItemText
          primary={
            <Typography dangerouslySetInnerHTML={{ __html: props.song.name }} />
          }
        />
        <ListItemSecondaryAction>
          <IconButton onClick={openMenu}>
            <MoreHoriz />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={deleteClick}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map(p => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            songs={[props.song]}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        songs={[props.song]}
        open={dialogOpen}
        handleClose={closeDialog}
      />
    </>
  );
};

export default QueueItem;
