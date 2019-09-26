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
import { useSelector } from "react-redux";
import { ISong } from "../models";
import { AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";

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
  const playlists = useSelector((state: AppState) => state.playlist.playlists);

  const playListClick = () => {
    props.onPlaylistClick(props.song);
  };
  const deleteClick = () => {
    props.onDeleteClick(props.song);
    closeMenu();
  };
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };
  const addToNewPlaylist = () => {
    openDialog();
    closeMenu();
  };
  const openDialog = () => {
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
  };
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
        </div>
      )}
    </Draggable>
  );
};

export default QueueItem;
