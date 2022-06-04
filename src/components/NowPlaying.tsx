import React from "react";
import { Song } from "../types";
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
  Button,
  Tooltip,
} from "@mui/material";
import { Delete, Info, MoreHoriz, PlaylistAdd } from "@mui/icons-material";
import {
  clearTracks,
  deleteTrack,
  setTrack,
  setTracks,
} from "../store/reducers/songReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { Link } from "react-router-dom";
import { db } from "../database";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { usePlugins } from "../PluginsContext";
import SelectionEditDialog from "./SelectionEditDialog";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";

const PlayQueue: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = React.useState<Song>({} as Song);
  const [from, setFrom] = React.useState<string>("");
  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const { plugins } = usePlugins();
  const openMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    song: Song
  ) => {
    const currentTarget = event.currentTarget;
    event.stopPropagation();
    event.preventDefault();
    setMenuSong(song);
    setAnchorEl(currentTarget);
  };

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);
  const closeQueueMenu = () => setQueueMenuAnchorEl(null);

  const songList = useAppSelector((state) => state.song.songs);
  const deleteClick = async () => {
    if (menuSong.id) {
      await db.audioBlobs.delete(menuSong.id);
    }
    dispatch(deleteTrack(menuSong));
    closeMenu();
  };
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const [queuePlaylistDialogOpen, setQueuePlaylistDialogOpen] =
    React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const openPlaylistDialog = () => setPlaylistDialogOpen(true);
  const openQueuePlaylistDialog = () => setQueuePlaylistDialogOpen(true);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const closeQueuePlaylistDialog = () => setQueuePlaylistDialogOpen(false);
  const openEditDialog = () => setEditDialogOpen(true);
  const closeEditDialog = () => setEditDialogOpen(false);

  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(songList);
  const addToNewPlaylist = () => {
    openPlaylistDialog();
    closeMenu();
  };
  const addToNewPlaylistQueue = () => {
    openQueuePlaylistDialog();
    closeQueueMenu();
  };
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const infoPath = `/track/${menuSong.id}`;

  const onTrackClick = (song: Song) => {
    dispatch(setTrack(song));
  };

  const clearQueue = () => {
    dispatch(clearTracks());
  };

  const onDragOver = (newTrackList: Song[]) => {
    dispatch(setTracks(newTrackList));
  };

  const onSelectFromChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setFrom(value);
    if (value) {
      const filterdList = songList
        .filter((s) => s.from === value)
        .map((s) => s.id) as string[];
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

  const editSelection = () => {
    openEditDialog();
  };

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
      {selected.size > 0 && (
        <Button onClick={editSelection}>Edit Selection</Button>
      )}
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
        tracks={songList}
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
        <MenuItem onClick={addToNewPlaylistQueue}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            songs={songList}
            closeMenu={closeQueueMenu}
          />
        ))}
      </Menu>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={deleteClick}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem component={Link} to={infoPath}>
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText primary="Info" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            songs={[menuSong]}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        songs={[menuSong]}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
      <AddPlaylistDialog
        songs={songList}
        open={queuePlaylistDialogOpen}
        handleClose={closeQueuePlaylistDialog}
      />
      <SelectionEditDialog
        open={editDialogOpen}
        trackIdSet={selected}
        onClose={closeEditDialog}
      />
    </>
  );
};

export default React.memo(PlayQueue);
