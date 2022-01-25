import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ISong } from "../models";
import { AppState, AppDispatch } from "../store/store";
import QueueItem from "./QueueItem";
import {
  Menu,
  ListItemText,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
  IconButton,
  List,
  ListItem,
} from "@mui/material";
import { Delete, Info, PlaylistAdd } from "@mui/icons-material";
import {
  clearTracks,
  deleteTrack,
  setTracks,
} from "../store/reducers/songReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { Link } from "react-router-dom";
import { AudioBlob, db } from "../database";
import { getFormatTrackApiFromName, getPlayerFromName } from "../utils";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const PlayQueue: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = React.useState<ISong>({} as ISong);
  const [canOffline, setCanOffline] = React.useState(false);
  const [hasBlob, setHasBlob] = React.useState(false);
  const openMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    song: ISong
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuSong(song);
    // Check whether song can be played offline
    if (song.id && song.from) {
      // Check if this needs it's own player
      // Intead of being able to play locally
      const playerApi = getPlayerFromName(song.from);
      setCanOffline(!playerApi);

      const primaryCount = await db.audioBlobs
        .where(":id")
        .equals(song.id)
        .count();
      console.log(song.id);
      setHasBlob(primaryCount > 0);
    }
  };
  const closeMenu = () => setAnchorEl(null);
  const songList = useSelector((state: AppState) => state.song.songs);
  const deleteClick = async () => {
    if (menuSong.id) {
      await db.audioBlobs.delete(menuSong.id);
    }
    dispatch(deleteTrack(menuSong));
    closeMenu();
  };
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);
  const addToNewPlaylist = () => {
    openDialog();
    closeMenu();
  };
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const infoPath = `/track/${menuSong.id}`;

  const clearQueue = () => {
    dispatch(clearTracks());
  };

  const enablePlayingOffline = async () => {
    try {
      if (menuSong.from) {
        const api = getFormatTrackApiFromName(menuSong.from);
        const source = await api?.getTrackUrl(menuSong);
        if (source && menuSong.id) {
          const data = await fetch(`http://localhost:8085/${source}`);
          const blob: AudioBlob = {
            id: menuSong.id,
            blob: await data.blob(),
          };
          await db.audioBlobs.add(blob);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Now Playing
      </Typography>
      <IconButton aria-label="clear" onClick={clearQueue} size="large">
        <Delete fontSize="large" />
      </IconButton>
      <DndContext sensors={sensors} onDragEnd={handleDragOver}>
        <List>
          <SortableContext
            items={songList.map((s) => s.id || "")}
            strategy={verticalListSortingStrategy}
          >
            {songList.map((songInfo) => (
              <QueueItem
                key={songInfo.id}
                song={songInfo}
                openMenu={openMenu}
              />
            ))}
          </SortableContext>
        </List>
      </DndContext>
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
        open={dialogOpen}
        handleClose={closeDialog}
      />
    </>
  );
};
export default React.memo(PlayQueue);
