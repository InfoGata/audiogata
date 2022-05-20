import { ListItem, ListItemText } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { PlaylistInfo } from "../types";

interface IProps {
  playlist: PlaylistInfo;
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
