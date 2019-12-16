import { ListItem, ListItemText } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { IPlaylist } from "../models";

interface IProps {
  playlist: IPlaylist;
}

const NavigationPlaylistItem: React.FC<IProps> = (props: IProps) => {
  const playlistPath = `/playlists/${props.playlist.id}`;

  return (
    <ListItem button={true} component={Link} to={playlistPath}>
      <ListItemText primary={props.playlist.name} />
    </ListItem>
  );
};

export default NavigationPlaylistItem;
