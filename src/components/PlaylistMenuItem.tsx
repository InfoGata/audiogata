import { PlaylistAdd } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylistTracks } from "../store/reducers/playlistReducer";

interface PlaylistMenuItemProps {
  playlist: PlaylistInfo;
  tracks: Track[];
  closeMenu: () => void;
  title: string;
}

const PlaylistMenuItem: React.FC<PlaylistMenuItemProps> = (props) => {
  const { playlist, closeMenu, tracks, title } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const addToPlaylist = () => {
    if (playlist.id) {
      dispatch(addPlaylistTracks(playlist, tracks));
      toast(
        t("addedTracksToPlaylist", {
          playlistName: playlist.name,
          count: tracks.length,
        })
      );
    }
    closeMenu();
  };
  return (
    <MenuItem onClick={addToPlaylist}>
      <ListItemIcon>
        <PlaylistAdd />
      </ListItemIcon>
      <ListItemText primary={title} />
    </MenuItem>
  );
};

export default PlaylistMenuItem;
