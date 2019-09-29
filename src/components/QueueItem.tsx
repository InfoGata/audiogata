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
import { Draggable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { deleteTrack, setTrack } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";

interface IProps {
  index: number;
  song: ISong;
  currentSong?: ISong;
}

const QueueItem: React.FC<IProps> = props => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
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
                <MoreHoriz />
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
        </div>
      )}
    </Draggable>
  );
};

export default QueueItem;
