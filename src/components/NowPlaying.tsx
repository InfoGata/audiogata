import React from "react";
import { ISong } from "../models";
import QueueItem from "./QueueItem";
import {
  Menu,
  ListItemText,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  useMediaQuery,
  InputLabel,
  FormControl,
  Select,
  SelectChangeEvent,
  Button,
  useTheme,
} from "@mui/material";
import { Delete, Info, PlaylistAdd } from "@mui/icons-material";
import {
  clearTracks,
  deleteTrack,
  setTrack,
  setTracks,
} from "../store/reducers/songReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import Sortable from "./Sortable";
import { Link } from "react-router-dom";
import { db } from "../database";
import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import SortableRow from "./SortableRow";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { usePlugins } from "../PluginsContext";
import SelectionEditDialog from "./SelectionEditDialog";
import { downloadTrack } from "../store/reducers/downloadReducer";

const PlayQueue: React.FC = () => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = React.useState<ISong>({} as ISong);
  const [canOffline, setCanOffline] = React.useState(false);
  const [hasBlob, setHasBlob] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [from, setFrom] = React.useState<string>("");
  const { plugins } = usePlugins();
  const dragDisabled = false;
  const theme = useTheme();
  const showTrackLength = useMediaQuery(theme.breakpoints.up("sm"));
  const lastChecked = React.useRef<number | null>(null);
  const openMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    song: ISong
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    event.preventDefault();
    setMenuSong(song);
    // Check whether song can be played offline
    if (song.id && song.from) {
      // Check if this needs it's own player
      // Intead of being able to play locally
      const pluginFrame = plugins.find((p) => p.id === song.from);
      const canDownload =
        (await pluginFrame?.hasDefined.getTrackUrl()) || false;
      setCanOffline(canDownload);

      const primaryCount = await db.audioBlobs
        .where(":id")
        .equals(song.id)
        .count();
      setHasBlob(primaryCount > 0);
    }
  };
  const closeMenu = () => setAnchorEl(null);
  const songList = useAppSelector((state) => state.song.songs);
  const deleteClick = async () => {
    if (menuSong.id) {
      await db.audioBlobs.delete(menuSong.id);
    }
    dispatch(deleteTrack(menuSong));
    closeMenu();
  };
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const openPlaylistDialog = () => setPlaylistDialogOpen(true);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const openEditDialog = () => setEditDialogOpen(true);
  const closeEditDialog = () => setEditDialogOpen(false);
  const addToNewPlaylist = () => {
    openPlaylistDialog();
    closeMenu();
  };
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const infoPath = `/track/${menuSong.id}`;

  const clearQueue = () => {
    dispatch(clearTracks());
  };

  const enablePlayingOffline = async () => {
    try {
      if (menuSong.from) {
        const pluginFrame = plugins.find((p) => p.id === menuSong.from);
        if (!(await pluginFrame?.hasDefined.getTrackUrl())) {
          return;
        }

        const source = await pluginFrame?.remote.getTrackUrl(menuSong);
        if (source) {
          dispatch(downloadTrack(menuSong, source));
        }
      }
    } catch (e) {
      console.log(e);
    }
    closeMenu();
  };

  const disablePlayingOffline = async () => {
    if (menuSong.id) {
      await db.audioBlobs.delete(menuSong.id);
    }
    closeMenu();
  };

  const offlineMenuItem = canOffline ? (
    hasBlob ? (
      <MenuItem onClick={disablePlayingOffline}>
        <ListItemText primary="Disable Playing Offline"></ListItemText>
      </MenuItem>
    ) : (
      <MenuItem onClick={enablePlayingOffline}>
        <ListItemText primary="Enable Playing Offline"></ListItemText>
      </MenuItem>
    )
  ) : null;

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    const oldIndex = songList.findIndex((item) => item.id === active.id);
    const newIndex = songList.findIndex((item) => item.id === over?.id);
    const newList = arrayMove(songList, oldIndex, newIndex);
    dispatch(setTracks(newList));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const playSong = (song: ISong) => {
    dispatch(setTrack(song));
  };
  const isSelected = (id: string) => selected.has(id);
  const onSelectClick = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const index = Number(e.target.dataset.index);
    if (
      lastChecked.current !== null &&
      (e.nativeEvent as any).shiftKey &&
      e.target.checked
    ) {
      setSelected((prev) => {
        const next = new Set(prev);
        const start = Math.min(lastChecked.current || 0, index);
        const end = Math.max(lastChecked.current || 0, index) + 1;
        const ids = songList.slice(start, end).map((s) => s.id);
        ids.forEach((id) => next.add(id || ""));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        e.target.checked ? next.add(id) : next.delete(id);
        return next;
      });
    }
    lastChecked.current = e.target.checked ? index : null;
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
      <IconButton aria-label="clear" onClick={clearQueue} size="large">
        <Delete fontSize="large" />
      </IconButton>
      <FormControl fullWidth>
        <InputLabel id="select-from">From</InputLabel>
        <Select
          id="select-form"
          value={from}
          label="From"
          onChange={onSelectFromChange}
        >
          <MenuItem value={""}>All</MenuItem>
          {optionsComponents}
        </Select>
      </FormControl>
      {selected.size > 0 && (
        <Button onClick={editSelection}>Edit Selection</Button>
      )}
      <Sortable
        ids={songList.map((s) => s.id || "")}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Title</TableCell>
                {showTrackLength && <TableCell>Track Length</TableCell>}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {songList.map((songInfo, index) => (
                <SortableRow
                  id={songInfo.id || ""}
                  key={songInfo.id}
                  onClick={() => playSong(songInfo)}
                  disabled={dragDisabled}
                >
                  <QueueItem
                    index={index}
                    song={songInfo}
                    isSelected={isSelected}
                    onSelectClick={onSelectClick}
                    openMenu={openMenu}
                    showTrackLength={showTrackLength}
                  />
                </SortableRow>
              ))}
              <DragOverlay wrapperElement="tr">
                {activeId ? (
                  <QueueItem
                    index={0}
                    showTrackLength={showTrackLength}
                    isSelected={isSelected}
                    onSelectClick={onSelectClick}
                    key={activeId}
                    song={
                      songList.find((s) => s.id === activeId) || ({} as ISong)
                    }
                    openMenu={openMenu}
                  />
                ) : null}
              </DragOverlay>
            </TableBody>
          </Table>
        </TableContainer>
      </Sortable>
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
        {offlineMenuItem}
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
      <SelectionEditDialog
        open={editDialogOpen}
        trackIdSet={selected}
        onClose={closeEditDialog}
      />
    </>
  );
};
export default React.memo(PlayQueue);
