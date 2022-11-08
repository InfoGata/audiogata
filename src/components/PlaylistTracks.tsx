import {
  Backdrop,
  IconButton,
  CircularProgress,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router";
import { playQueue, setTrack, setTracks } from "../store/reducers/trackReducer";
import { db } from "../database";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPlaylistTracks } from "../store/reducers/playlistReducer";
import { Delete, Edit, Info, MoreHoriz, PlayCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";
import EditPlaylistDialog from "./EditPlaylistDialog";
import SelectTrackListPlugin from "./SelectTrackListPlugin";
import useTrackMenu from "../hooks/useTrackMenu";
import { useTranslation } from "react-i18next";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenu from "./PlaylistMenu";

const PlaylistTracks: React.FC = () => {
  const { playlistId } = useParams<"playlistId">();
  const dispatch = useAppDispatch();
  const [playlist, setPlaylist] = React.useState<PlaylistInfo | undefined>();
  const [loaded, setLoaded] = React.useState(false);
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const navigate = useNavigate();
  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };
  const closeQueueMenu = () => setQueueMenuAnchorEl(null);
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

  const clearSelectedTracks = async () => {
    await db.audioBlobs.bulkDelete(Array.from(selected));
    if (playlist) {
      const newTracklist = tracklist.filter((t) => !selected.has(t.id ?? ""));
      dispatch(setPlaylistTracks(playlist, newTracklist));
      setTracklist(newTracklist);
    }
    closeQueueMenu();
  };

  const selectedMenuItems = [
    <MenuItem onClick={clearSelectedTracks} key="clear">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary={t("deleteSelectedTracks")} />
    </MenuItem>,
  ];

  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== playlistId)
  );

  const { openMenu, menuTrack } = useTrackMenu({
    playlists,
    listItems,
  });
  const [tracklist, setTracklist] = React.useState<Track[]>([]);
  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(tracklist || []);
  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === playlistId)
  );

  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const selectedTracks = tracklist.filter((t) => selected.has(t.id ?? ""));

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
          <PlaylistMenu
            selected={selected}
            tracklist={tracklist}
            playlists={playlists}
            selectedMenuItems={selectedMenuItems}
            anchorElement={queueMenuAnchorEl}
            onClose={closeQueueMenu}
          />
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
          <EditPlaylistDialog
            open={openEditMenu}
            playlist={playlist}
            handleClose={onEditMenuClose}
          />
          <AddPlaylistDialog
            tracks={selectedTracks}
            open={playlistDialogOpen}
            handleClose={closePlaylistDialog}
          />
        </>
      ) : (
        <>{loaded && <Typography>{t("notFound")}</Typography>}</>
      )}
    </>
  );
};

export default PlaylistTracks;
