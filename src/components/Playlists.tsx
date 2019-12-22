import { List, ListItem, ListItemText } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { IPlaylist } from "../models";
import { AppState } from "../store/store";

interface IPlaylistsItemProps {
  playlist: IPlaylist;
}

const PlaylistsItem: React.FC<IPlaylistsItemProps> = props => {
  return (
    <ListItem>
      <ListItemText>{props.playlist.name}</ListItemText>
    </ListItem>
  );
};

const Playlists: React.FC = () => {
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  return (
    <List>
      {playlists.map(p => (
        <PlaylistsItem key={p.id} playlist={p} />
      ))}
    </List>
  );
};

export default Playlists;
