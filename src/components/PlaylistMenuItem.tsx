import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { PlaylistAdd } from "@mui/icons-material";
import React from "react";
import { PlaylistInfo, ISong } from "../types";
import { useAppDispatch } from "../store/hooks";
import { addPlaylistTracks } from "../store/reducers/playlistReducer";

interface PlaylistMenuItemProps {
  playlist: PlaylistInfo;
  songs: ISong[];
  closeMenu: () => void;
}

const PlaylistMenuItem: React.FC<PlaylistMenuItemProps> = (props) => {
  const { playlist, closeMenu, songs } = props;
  const dispatch = useAppDispatch();

  const addToPlaylist = () => {
    if (playlist.id) {
      dispatch(addPlaylistTracks(playlist, songs));
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
