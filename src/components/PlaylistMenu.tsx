import { MoreHoriz, PlaylistAdd, PlaylistPlay } from "@mui/icons-material";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { PlaylistInfo, Track } from "../plugintypes";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { useTranslation } from "react-i18next";
import { addTracks } from "../store/reducers/trackReducer";
import { useAppDispatch } from "../store/hooks";
import AddPlaylistDialog from "./AddPlaylistDialog";

interface PlaylistMenuProps {
  playlists: PlaylistInfo[];
  selected: Set<string>;
  tracklist: Track[];
  selectedMenuItems?: JSX.Element[];
  anchorElement: HTMLElement | null;
  onClose: () => void;
}

const PlaylistMenu: React.FC<PlaylistMenuProps> = (props) => {
  const {
    playlists,
    selected,
    tracklist,
    selectedMenuItems,
    anchorElement,
    onClose,
  } = props;
  const { t } = useTranslation();
  const [playlistDialogTracks, setPlaylistDialogTracks] = React.useState<
    Track[]
  >([]);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const dispatch = useAppDispatch();

  const selectedTracks = tracklist.filter((t) => selected.has(t.id ?? ""));

  const addPlaylistToQueue = () => {
    dispatch(addTracks(tracklist));
    onClose();
  };

  const addSelectedToQueue = () => {
    dispatch(addTracks(selectedTracks));
    onClose();
  };

  const addSelectedToNewPlaylist = () => {
    setPlaylistDialogTracks(selectedTracks);
    setPlaylistDialogOpen(true);
    onClose();
  };

  const addToNewPlaylist = () => {
    setPlaylistDialogTracks(tracklist);
    setPlaylistDialogOpen(true);
    onClose();
  };

  return (
    <>
      <Menu
        open={Boolean(anchorElement)}
        onClose={onClose}
        anchorEl={anchorElement}
      >
        <MenuItem onClick={addPlaylistToQueue}>
          <ListItemIcon>
            <PlaylistPlay />
          </ListItemIcon>
          <ListItemText primary={t("addTracksToQueue")} />
        </MenuItem>
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary={t("addTracksToNewPlaylist")} />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={tracklist}
            closeMenu={onClose}
            title={t("addTracksToPlaylist", { playlistName: p.name })}
          />
        ))}
        {selected.size > 0 && [
          <Divider key="divider" />,
          selectedMenuItems,
          <MenuItem onClick={addSelectedToQueue} key="add">
            <ListItemIcon>
              <PlaylistPlay />
            </ListItemIcon>
            <ListItemText primary={t("addSelectedToQueue")} />
          </MenuItem>,
          <MenuItem onClick={addSelectedToNewPlaylist} key="selectednew">
            <ListItemIcon>
              <PlaylistAdd />
            </ListItemIcon>
            <ListItemText primary={t("addSelectedToNewPlaylist")} />
          </MenuItem>,
          playlists.map((p) => (
            <PlaylistMenuItem
              key={p.id}
              playlist={p}
              tracks={selectedTracks}
              closeMenu={onClose}
              title={t("addSelectedToPlaylist", { playlistName: p.name })}
            />
          )),
        ]}
      </Menu>
      <AddPlaylistDialog
        tracks={playlistDialogTracks}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default PlaylistMenu;
