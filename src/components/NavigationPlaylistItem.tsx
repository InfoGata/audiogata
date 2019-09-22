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

const linkToPlaylist = (props: any, id?: string) => {
  const path = `/playlist/${id}`;
  return <Link to={path} {...props} />;
};

interface IProps {
  playlist: IPlaylist;
}

const NavigationPlaylistItem: React.FC<IProps> = (props: IProps) => {
  const dispatch = useDispatch();
  function deletePlaylistItem() {
    dispatch(deletePlaylist(props.playlist));
  }
  function goToPlaylist(playlistProps: any) {
    return linkToPlaylist(playlistProps, props.playlist.id);
  }
  return (
    <ListItem button={true} component={goToPlaylist}>
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
