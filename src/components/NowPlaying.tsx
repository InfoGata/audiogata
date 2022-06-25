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
  InputLabel,
  FormControl,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import { Delete, MoreHoriz, PlaylistAdd } from "@mui/icons-material";
import {
  clearTracks,
  deleteTrack,
  deleteTracks,
  setTrack,
  setTracks,
} from "../store/reducers/trackReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { db } from "../database";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { usePlugins } from "../PluginsContext";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";

const PlayQueue: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuTrack, setMenuTrack] = React.useState<Track>({} as Track);
  const [from, setFrom] = React.useState<string>("");
  const [playlistDialogTracks, setPlaylistDialogTracks] = React.useState<
    Track[]
  >([]);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();

  const openMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    const currentTarget = event.currentTarget;
    event.stopPropagation();
    event.preventDefault();
    setMenuTrack(track);
    setAnchorEl(currentTarget);
  };

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);
  const closeQueueMenu = () => setQueueMenuAnchorEl(null);

  const trackList = useAppSelector((state) => state.track.tracks);
  const deleteClick = async () => {
    if (menuTrack.id) {
      await db.audioBlobs.delete(menuTrack.id);
    }
    closeMenu();
    dispatch(deleteTrack(menuTrack));
  };
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(trackList);

  const addTrackToNewPlaylist = () => {
    setPlaylistDialogTracks([menuTrack]);
    setPlaylistDialogOpen(true);
    closeMenu();
  };
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

  const onSelectFromChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setFrom(value);
    if (value) {
      const filterdList = trackList
        .filter((t) => t.pluginId === value)
        .map((t) => t.id) as string[];
      setSelected(new Set(filterdList));
    } else {
      setSelected(new Set());
    }
  };

  const options = plugins.map((p) => [p.id || "", p.name || ""]);
  const optionsComponents = options.map((option) => (
    <MenuItem key={option[0]} value={option[0]}>
      {option[1]}
    </MenuItem>
  ));

  return (
    <>
      <Typography variant="h3" gutterBottom>
        Now Playing
      </Typography>
      <IconButton aria-label="clear" onClick={clearQueue}>
        <Tooltip title="Clear All Tracks">
          <Delete fontSize="large" />
        </Tooltip>
      </IconButton>
      <IconButton aria-label="clear" onClick={openQueueMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      <FormControl fullWidth>
        <InputLabel id="select-from">Select Plugin</InputLabel>
        <Select
          id="select-form"
          value={from}
          label="Select Plugin"
          onChange={onSelectFromChange}
        >
          <MenuItem value={""}>None</MenuItem>
          {optionsComponents}
        </Select>
      </FormControl>
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
            namePrefix={"Add Queue to "}
          />
        ))}
        {selected.size > 0 && (
          <>
            <Divider />
            <MenuItem onClick={clearSelectedTracks}>
              <ListItemIcon>
                <Delete />
              </ListItemIcon>
              <ListItemText primary="Clear Selected Tracks" />
            </MenuItem>
            <MenuItem onClick={addSelectedToNewPlaylist}>
              <ListItemIcon>
                <PlaylistAdd />
              </ListItemIcon>
              <ListItemText primary="Add Selected To New Playlist" />
            </MenuItem>
            {playlists.map((p) => (
              <PlaylistMenuItem
                key={p.id}
                playlist={p}
                tracks={selectedTracks}
                closeMenu={closeQueueMenu}
                namePrefix={"Add Selected to "}
              />
            ))}
          </>
        )}
      </Menu>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={deleteClick}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={addTrackToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={[menuTrack]}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        tracks={playlistDialogTracks}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default React.memo(PlayQueue);
