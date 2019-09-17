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
import DeleteIcon from "@material-ui/icons/Delete";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { IPlaylist, ISong } from "../services/data/database";
import { addSongs } from "../store/actions/playlist";
import { AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";

interface IProps {
  index: number;
  song: ISong;
  currentSong?: ISong;
  onDeleteClick: (song: ISong) => void;
  onPlaylistClick: (song: ISong) => void;
}

const QueueItem: React.FC<IProps> = props => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const dispatch = useDispatch();
  const playlists = useSelector((state: AppState) => state.playlist.playlists);

  function playListClick() {
    props.onPlaylistClick(props.song);
  }
  function deleteClick() {
    props.onDeleteClick(props.song);
    closeMenu();
  }
  function openMenu(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function closeMenu() {
    setAnchorEl(null);
  }
  function addToNewPlaylist() {
    openDialog();
    closeMenu();
  }
  function openDialog() {
    setDialogOpen(true);
  }
  function closeDialog() {
    setDialogOpen(false);
  }
  function addToPlaylist(playlist: IPlaylist) {
    if (playlist.id) {
      dispatch(addSongs(playlist.id, [props.song]));
    }
    closeMenu();
  }
  return (
    <Draggable
      key={props.song.id}
      draggableId={props.song.id || ""}
      index={props.index}
    >
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItem
            button={true}
            key={props.song.id}
            selected={
              props.currentSong && props.currentSong.id === props.song.id
            }
            onClick={playListClick}
          >
            <ListItemText
              primary={
                <Typography
                  dangerouslySetInnerHTML={{ __html: props.song.name }}
                />
              }
            />
            <ListItemSecondaryAction>
              <IconButton onClick={openMenu}>
                <MoreHorizIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Menu
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorEl={anchorEl}
          >
            <MenuItem onClick={deleteClick}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={addToNewPlaylist}>
              <ListItemIcon>
                <PlaylistAddIcon />
              </ListItemIcon>
              <ListItemText primary="Add To New Playlist" />
            </MenuItem>
            {playlists.map(p => (
              // tslint:disable-next-line: jsx-no-lambda
              <MenuItem key={p.id} onClick={() => addToPlaylist(p)}>
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <ListItemText primary={p.name} />
              </MenuItem>
            ))}
          </Menu>
          <AddPlaylistDialog
            songs={[props.song]}
            open={dialogOpen}
            handleClose={closeDialog}
          />
        </div>
      )}
    </Draggable>
  );
};

export default QueueItem;
