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
import { useNavigate } from "react-router-dom";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";
import EditPlaylistDialog from "./EditPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import SelectTrackListPlugin from "./SelectTrackListPlugin";
import SelectionEditDialog from "./SelectionEditDialog";
import useTrackMenu from "../hooks/useTrackMenu";
import { useTranslation } from "react-i18next";

const PlaylistTracks: React.FC = () => {
  const { playlistId } = useParams<"playlistId">();
  const dispatch = useAppDispatch();
  const [playlist, setPlaylist] = React.useState<PlaylistInfo | undefined>();
  const [loaded, setLoaded] = React.useState(false);
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const [editSelectDialogOpen, setEditSelectDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const deleteClick = async () => {
    if (menuTrack?.id) {
      await db.audioBlobs.delete(menuTrack.id);
    }
    if (playlist && menuTrack) {
      const newTracklist = tracklist.filter((t) => t.id !== menuTrack.id);
      dispatch(setPlaylistTracks(playlist, newTracklist));
      setTracklist(newTracklist);
    }

    closeMenu();
  };

  const infoClick = () => {
    const url = `/playlists/${playlistId}/tracks/${menuTrack?.id}`;
    navigate(url);
  };

  const listItems = [
    <MenuItem onClick={deleteClick} key="Delete">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary={t("delete")} />
    </MenuItem>,
    <MenuItem onClick={infoClick} key="Info">
      <ListItemIcon>
        <Info />
      </ListItemIcon>
      <ListItemText primary={t("info")} />
    </MenuItem>,
  ];

  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== playlistId)
  );

  const { closeMenu, openMenu, menuTrack } = useTrackMenu({
    playlists,
    listItems,
  });
  const [tracklist, setTracklist] = React.useState<Track[]>([]);
  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(tracklist || []);
  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === playlistId)
  );

  const openEditSelectDialog = () => setEditSelectDialogOpen(true);

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const selectedTracks = tracklist.filter((t) => selected.has(t.id ?? ""));

  const closeQueueMenu = () => setQueueMenuAnchorEl(null);
  const closeEditSelectDialog = () => setEditSelectDialogOpen(false);

  const onEditMenuOpen = () => {
    setOpenEditMenu(true);
  };

  const onEditMenuClose = () => {
    setOpenEditMenu(false);
  };

  React.useEffect(() => {
    const getPlaylist = async () => {
      if (playlistId) {
        const playlist = await db.playlists.get(playlistId);
        setPlaylist(await db.playlists.get(playlistId));
        setTracklist(playlist?.tracks ?? []);
        setLoaded(true);
      }
    };
    getPlaylist();
  }, [playlistId]);

  const playPlaylist = () => {
    if (!playlist) {
      return;
    }

    dispatch(setTracks(tracklist));
    dispatch(playQueue());
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

  const addSelectedToQueue = () => {
    dispatch(addTracks(selectedTracks));
    closeQueueMenu();
  };

  const addPlaylistToQueue = () => {
    dispatch(addTracks(tracklist));
    closeQueueMenu();
  };

  const onSelectedEdited = (pluginId?: string) => {
    if (pluginId && playlist) {
      const newTrackList = tracklist.map((t) =>
        t.id && selected.has(t.id) ? { ...t, pluginId: pluginId } : t
      );
      dispatch(setPlaylistTracks(playlist, newTrackList));
      setTracklist(newTrackList);
    }
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
          <SelectTrackListPlugin
            trackList={tracklist}
            setSelected={setSelected}
          />
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
              <ListItemText primary={t("addTracksToQueue")} />
            </MenuItem>
            {playlists.map((p) => (
              <PlaylistMenuItem
                key={p.id}
                playlist={p}
                tracks={tracklist}
                closeMenu={closeQueueMenu}
                title={t("addTracksToPlaylist", { playlistName: p.name })}
              />
            ))}
            {selected.size > 0 && [
              <Divider key="divider" />,
              <MenuItem onClick={clearSelectedTracks} key="clear">
                <ListItemIcon>
                  <Delete />
                </ListItemIcon>
                <ListItemText primary={t("deleteSelectedTracks")} />
              </MenuItem>,
              <MenuItem onClick={openEditSelectDialog} key="edit">
                <ListItemIcon>
                  <Edit />
                </ListItemIcon>
                <ListItemText primary={t("editSelectedTracks")} />
              </MenuItem>,
              <MenuItem onClick={addSelectedToQueue} key="add">
                <ListItemIcon>
                  <PlaylistPlay />
                </ListItemIcon>
                <ListItemText primary={t("addSelectedToQueue")} />
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
          <EditPlaylistDialog
            open={openEditMenu}
            playlist={playlist}
            handleClose={onEditMenuClose}
          />
          <SelectionEditDialog
            open={editSelectDialogOpen}
            onClose={closeEditSelectDialog}
            onSave={onSelectedEdited}
          />
        </>
      ) : (
        <>{loaded && <Typography>{t("notFound")}</Typography>}</>
      )}
    </>
  );
};

export default PlaylistTracks;
