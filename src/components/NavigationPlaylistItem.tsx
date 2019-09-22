import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { IPlaylist } from "../models";
import { deletePlaylist } from "../store/reducers/playlistReducer";

interface IProps {
  playlist: IPlaylist;
}

const NavigationPlaylistItem: React.FC<IProps> = (props: IProps) => {
  const dispatch = useDispatch();
  const playlistPath = `/playlist/${props.playlist.id}`;
  function deletePlaylistItem() {
    dispatch(deletePlaylist(props.playlist));
  }
  return (
    <ListItem button={true} component={Link} to={playlistPath}>
      <ListItemText primary={props.playlist.name} />
      <ListItemSecondaryAction>
        <IconButton aria-label="Delete" onClick={deletePlaylistItem}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default NavigationPlaylistItem;
