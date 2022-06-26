import {
  Backdrop,
  IconButton,
  CircularProgress,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Divider,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router";
import {
  addTrack,
  addTracks,
  playQueue,
  setTrack,
  setTracks,
} from "../store/reducers/trackReducer";
import { db } from "../database";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPlaylistTracks } from "../store/reducers/playlistReducer";
import {
  Delete,
  Edit,
  Info,
  MoreHoriz,
  PlayCircle,
  PlaylistPlay,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { downloadTrack } from "../store/reducers/downloadReducer";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";
import EditPlaylistDialog from "./EditPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";

const PlaylistTracks: React.FC = () => {
  const { id } = useParams<"id">();
  const dispatch = useAppDispatch();
  const [playlist, setPlaylist] = React.useState<PlaylistInfo | undefined>();
  const [loaded, setLoaded] = React.useState(false);
  const [menuTrack, setMenuTrack] = React.useState<Track>({} as Track);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hasBlob, setHasBlob] = React.useState(false);
  const [canOffline, setCanOffline] = React.useState(false);
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const { plugins } = usePlugins();
  const infoPath = `/playlists/${id}/tracks/${menuTrack.id}`;
  const closeMenu = () => setAnchorEl(null);
  const [tracklist, setTracklist] = React.useState<Track[]>([]);
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(
    tracklist || []
  );
  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === id)
  );

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== id)
  );
  const selectedTracks = tracklist.filter((t) => selected.has(t.id ?? ""));

  const closeQueueMenu = () => setQueueMenuAnchorEl(null);

  const onEditMenuOpen = () => {
    setOpenEditMenu(true);
  };

  const onEditMenuClose = () => {
    setOpenEditMenu(false);
  };

  React.useEffect(() => {
    const getPlaylist = async () => {
      if (id) {
        const playlist = await db.playlists.get(id);
        setPlaylist(await db.playlists.get(id));
        setTracklist(playlist?.tracks ?? []);
        setLoaded(true);
      }
    };
    getPlaylist();
  }, [id]);

  const playPlaylist = () => {
    if (!playlist) {
      return;
    }

    dispatch(setTracks(tracklist));
    dispatch(playQueue());
  };

  const openMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    const currentTarget = event.currentTarget;
    event.stopPropagation();
    event.preventDefault();
    setMenuTrack(track);
    setAnchorEl(currentTarget);
    // Check whether track can be played offline
    if (track.id && track.pluginId) {
      // Check if this needs it's own player
      // Instead of being able to play locally
      const pluginFrame = plugins.find((p) => p.id === track.pluginId);
      const canDownload =
        (await pluginFrame?.hasDefined.onGetTrackUrl()) || false;
      setCanOffline(canDownload);

      const primaryCount = await db.audioBlobs
        .where(":id")
        .equals(track.id)
        .count();
      setHasBlob(primaryCount > 0);
    }
  };

  const deleteClick = async () => {
    if (menuTrack.id) {
      await db.audioBlobs.delete(menuTrack.id);
    }
    if (playlist) {
      const newTracklist = tracklist.filter((t) => t.id !== menuTrack.id);
      dispatch(setPlaylistTracks(playlist, newTracklist));
      setTracklist(newTracklist);
    }

    closeMenu();
  };

  const clearSelectedTracks = async () => {
    await db.audioBlobs.bulkDelete(Array.from(selected));
    if (playlist) {
      const newTracklist = tracklist.filter((t) => !selected.has(t.id ?? ""));
      dispatch(setPlaylistTracks(playlist, newTracklist));
      setTracklist(newTracklist);
    }
    closeQueueMenu();
  };

  const enablePlayingOffline = async () => {
    try {
      if (menuTrack.pluginId) {
        const pluginFrame = plugins.find((p) => p.id === menuTrack.pluginId);
        if (!(await pluginFrame?.hasDefined.onGetTrackUrl())) {
          return;
        }

        const source = await pluginFrame?.remote.onGetTrackUrl(menuTrack);
        if (source) {
          dispatch(downloadTrack(menuTrack, source));
        }
      }
    } catch (e) {
      console.log(e);
    }
    closeMenu();
  };

  const disablePlayingOffline = async () => {
    if (menuTrack.id) {
      await db.audioBlobs.delete(menuTrack.id);
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

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
    dispatch(setTracks(tracklist));
  };

  const onDragOver = (trackList: Track[]) => {
    if (playlist) {
      dispatch(setPlaylistTracks(playlist, trackList));
      setTracklist(tracklist);
    }
  };

  const addTrackToQueue = () => {
    dispatch(addTrack(menuTrack));
    closeMenu();
  };

  const addSelectedToQueue = () => {
    dispatch(addTracks(selectedTracks));
    closeQueueMenu();
  };

  const addPlaylistToQueue = () => {
    dispatch(addTracks(tracklist));
    closeQueueMenu();
  };

  return (
    <>
      <Backdrop open={!loaded}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {playlist ? (
        <>
          <Grid sx={{ display: "flex" }}>
            <Typography variant="h3">{playlistInfo?.name}</Typography>
            <IconButton onClick={onEditMenuOpen}>
              <Edit />
            </IconButton>
          </Grid>
          <IconButton size="large" onClick={playPlaylist}>
            <PlayCircle color="success" sx={{ fontSize: 45 }} />
          </IconButton>
          <IconButton onClick={openQueueMenu}>
            <MoreHoriz fontSize="large" />
          </IconButton>
          <TrackList
            tracks={tracklist}
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
            <MenuItem onClick={addPlaylistToQueue}>
              <ListItemIcon>
                <PlaylistPlay />
              </ListItemIcon>
              <ListItemText primary="Add Tracks To Queue" />
            </MenuItem>
            {playlists.map((p) => (
              <PlaylistMenuItem
                key={p.id}
                playlist={p}
                tracks={tracklist}
                closeMenu={closeQueueMenu}
                namePrefix="Add Tracks to "
              />
            ))}
            {selected.size > 0 && [
              <Divider key="divider" />,
              <MenuItem onClick={addSelectedToQueue} key="add">
                <ListItemIcon>
                  <PlaylistPlay />
                </ListItemIcon>
                <ListItemText primary="Add Selected To Queue" />
              </MenuItem>,
              <MenuItem onClick={clearSelectedTracks} key="clear">
                <ListItemIcon>
                  <Delete />
                </ListItemIcon>
                <ListItemText primary="Delete Selected Tracks" />
              </MenuItem>,
              playlists.map((p) => (
                <PlaylistMenuItem
                  key={p.id}
                  playlist={p}
                  tracks={selectedTracks}
                  closeMenu={closeQueueMenu}
                  namePrefix="Add Selected to "
                />
              )),
            ]}
          </Menu>
          <Menu
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorEl={anchorEl}
          >
            <MenuItem onClick={addTrackToQueue}>
              <ListItemIcon>
                <PlaylistPlay />
              </ListItemIcon>
              <ListItemText primary="Add to Queue" />
            </MenuItem>
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
            {playlists.map((p) => (
              <PlaylistMenuItem
                key={p.id}
                playlist={p}
                tracks={[menuTrack]}
                closeMenu={closeMenu}
                namePrefix="Add track to "
              />
            ))}
            {offlineMenuItem}
          </Menu>
          <EditPlaylistDialog
            open={openEditMenu}
            playlist={playlist}
            handleClose={onEditMenuClose}
          />
        </>
      ) : (
        <>{loaded && <Typography>Not Found</Typography>}</>
      )}
    </>
  );
};

export default PlaylistTracks;
