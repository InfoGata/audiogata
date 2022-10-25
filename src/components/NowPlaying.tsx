import React from "react";
import { Track } from "../plugintypes";
import {
  Menu,
  ListItemText,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Delete,
  Edit,
  Info,
  MoreHoriz,
  PlaylistAdd,
} from "@mui/icons-material";
import {
  clearTracks,
  deleteTrack,
  deleteTracks,
  setTrack,
  setTracks,
  updatePluginId,
} from "../store/reducers/trackReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { db } from "../database";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";
import { useNavigate } from "react-router-dom";
import SelectTrackListPlugin from "./SelectTrackListPlugin";
import SelectionEditDialog from "./SelectionEditDialog";
import useTrackMenu from "../hooks/useTrackMenu";
import { useTranslation } from "react-i18next";

const NowPlaying: React.FC = () => {
  const { t } = useTranslation();
  const [playlistDialogTracks, setPlaylistDialogTracks] = React.useState<
    Track[]
  >([]);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const [editSelectDialogOpen, setEditSelectDialogOpen] = React.useState(false);
  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const deleteClick = async () => {
    if (menuTrack?.id) {
      await db.audioBlobs.delete(menuTrack.id);
    }
    closeMenu();
    if (menuTrack) {
      dispatch(deleteTrack(menuTrack));
    }
  };

  const infoClick = () => {
    const url = `/track/${menuTrack?.id}`;
    navigate(url);
  };

  const listItems = [
    <MenuItem onClick={deleteClick} key="Delete">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary="Delete" />
    </MenuItem>,
    <MenuItem onClick={infoClick} key="Info">
      <ListItemIcon>
        <Info />
      </ListItemIcon>
      <ListItemText primary="Info" />
    </MenuItem>,
  ];

  const { closeMenu, openMenu, menuTrack } = useTrackMenu({
    listItems,
    noQueueItem: true,
  });

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const openEditSelectDialog = () => setEditSelectDialogOpen(true);

  const closeQueueMenu = () => setQueueMenuAnchorEl(null);
  const closeEditSelectDialog = () => setEditSelectDialogOpen(false);

  const trackList = useAppSelector((state) => state.track.tracks);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(trackList);

  const addQueueToNewPlaylist = () => {
    setPlaylistDialogTracks(trackList);
    setPlaylistDialogOpen(true);
    closeQueueMenu();
  };

  const selectedTracks = trackList.filter((t) => selected.has(t.id ?? ""));

  const addSelectedToNewPlaylist = () => {
    setPlaylistDialogTracks(selectedTracks);
    setPlaylistDialogOpen(true);
    closeQueueMenu();
  };

  const clearSelectedTracks = () => {
    dispatch(deleteTracks(selected));
    closeQueueMenu();
  };

  const playlists = useAppSelector((state) => state.playlist.playlists);

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
  };

  const clearQueue = () => {
    dispatch(clearTracks());
  };

  const onDragOver = (newTrackList: Track[]) => {
    dispatch(setTracks(newTrackList));
  };

  const onSelectedEdited = (pluginId?: string) => {
    if (pluginId) {
      dispatch(updatePluginId({ updateIds: selected, pluginId: pluginId }));
    }
  };

  return (
    <>
      <Typography variant="h3" gutterBottom>
        {t("playQueue")}
      </Typography>
      <IconButton aria-label="clear" onClick={clearQueue}>
        <Tooltip title="Clear All Tracks">
          <Delete fontSize="large" />
        </Tooltip>
      </IconButton>
      <IconButton onClick={openQueueMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      <SelectTrackListPlugin trackList={trackList} setSelected={setSelected} />
      <TrackList
        tracks={trackList}
        openMenu={openMenu}
        onTrackClick={onTrackClick}
        onDragOver={onDragOver}
        onSelect={onSelect}
        isSelected={isSelected}
        onSelectAll={onSelectAll}
        selected={selected}
      />
      <Menu
        open={Boolean(queueMenuAnchorEl)}
        onClose={closeQueueMenu}
        anchorEl={queueMenuAnchorEl}
      >
        <MenuItem onClick={clearQueue}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary="Clear All Tracks" />
        </MenuItem>
        <MenuItem onClick={addQueueToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add Queue To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={trackList}
            closeMenu={closeQueueMenu}
            title={t("addQueueToPlaylist", { playlistName: p.name })}
          />
        ))}
        {selected.size > 0 && [
          <Divider key="divider" />,
          <MenuItem onClick={clearSelectedTracks} key="clear">
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText primary="Clear Selected Tracks" />
          </MenuItem>,
          <MenuItem onClick={openEditSelectDialog} key="edit">
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary="Edit Selected Tracks" />
          </MenuItem>,
          <MenuItem onClick={addSelectedToNewPlaylist} key="newplaylist">
            <ListItemIcon>
              <PlaylistAdd />
            </ListItemIcon>
            <ListItemText primary="Add Selected To New Playlist" />
          </MenuItem>,
          playlists.map((p) => (
            <PlaylistMenuItem
              key={p.id}
              playlist={p}
              tracks={selectedTracks}
              closeMenu={closeQueueMenu}
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
      <SelectionEditDialog
        open={editSelectDialogOpen}
        onClose={closeEditSelectDialog}
        onSave={onSelectedEdited}
      />
    </>
  );
};

export default React.memo(NowPlaying);
