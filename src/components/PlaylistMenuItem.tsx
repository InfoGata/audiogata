import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React from "react";
import { useDispatch } from "react-redux";
import { IPlaylist, ISong } from "../services/data/database";
import { addSongs } from "../store/reducers/playlistReducer";

interface IProps {
  playlist: IPlaylist;
  songs: ISong[];
  closeMenu: () => void;
}

const PlaylistMenuItem: React.FC<IProps> = props => {
  const { playlist, closeMenu, songs } = props;
  const dispatch = useDispatch();
  function addToPlaylist() {
    if (playlist.id) {
      dispatch(addSongs(playlist.id, songs));
    }
    closeMenu();
  }
  return (
    <MenuItem onClick={addToPlaylist}>
      <ListItemIcon>
        <PlaylistAddIcon />
      </ListItemIcon>
      <ListItemText primary={playlist.name} />
    </MenuItem>
  );
};

export default PlaylistMenuItem;
