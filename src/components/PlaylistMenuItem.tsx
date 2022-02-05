import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { PlaylistAdd } from "@mui/icons-material";
import React from "react";
import { IPlaylist, ISong } from "../models";
import { addSongs } from "../store/reducers/playlistReducer";
import { useAppDispatch } from "../store/hooks";

interface IProps {
  playlist: IPlaylist;
  songs: ISong[];
  closeMenu: () => void;
}

const PlaylistMenuItem: React.FC<IProps> = (props) => {
  const { playlist, closeMenu, songs } = props;
  const dispatch = useAppDispatch();

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
