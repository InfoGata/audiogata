import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import { PlaylistAdd } from "@material-ui/icons";
import React from "react";
import { useDispatch } from "react-redux";
import { IPlaylist, ISong } from "../models";
import { addSongs } from "../store/reducers/playlistReducer";
import { AppDispatch } from "../store/store";

interface IProps {
  playlist: IPlaylist;
  songs: ISong[];
  closeMenu: () => void;
}

const PlaylistMenuItem: React.FC<IProps> = props => {
  const { playlist, closeMenu, songs } = props;
  const dispatch = useDispatch<AppDispatch>();

  const addToPlaylist = () => {
    if (playlist.id) {
      dispatch(addSongs(playlist.id, songs));
    }
    closeMenu();
  };
  return (
    <MenuItem onClick={addToPlaylist}>
      <ListItemIcon>
        <PlaylistAdd />
      </ListItemIcon>
      <ListItemText primary={playlist.name} />
    </MenuItem>
  );
};

export default PlaylistMenuItem;
