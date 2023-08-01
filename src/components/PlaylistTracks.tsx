import {
  Delete,
  Edit,
  Info,
  MoreHoriz,
  PlayCircle,
  UploadFile,
} from "@mui/icons-material";
import {
  Backdrop,
  CircularProgress,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { db } from "../database";
import useSelected from "../hooks/useSelected";
import useTrackMenu from "../hooks/useTrackMenu";
import { Playlist, Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addPlaylistTracks,
  setPlaylistTracks,
} from "../store/reducers/playlistReducer";
import { playQueue, setTrack, setTracks } from "../store/reducers/trackReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import ConvertTracksDialog from "./ConvertTracksDialog";
import EditPlaylistDialog from "./EditPlaylistDialog";
import ImportDialog from "./ImportDialog";
import PlaylistMenu from "./PlaylistMenu";
import SelectTrackListPlugin from "./SelectTrackListPlugin";
import TrackList from "./TrackList";

const PlaylistTracks: React.FC = () => {
  const { playlistId } = useParams<"playlistId">();
  const dispatch = useAppDispatch();
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const [openConvertDialog, setOpenConvertDialog] = React.useState(false);
  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };
  const closeQueueMenu = () => setQueueMenuAnchorEl(null);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  const { t } = useTranslation();
  const playlist = useLiveQuery(
    () => db.playlists.get(playlistId || ""),
    [playlistId],
    false
  );
  const tracklist = (playlist && playlist?.tracks) || [];

  const getListItems = (track?: Track) => {
    const deleteClick = async () => {
      if (track?.id) {
        await db.audioBlobs.delete(track.id);
      }
      if (playlist && track) {
        const newTracklist = tracklist.filter((t) => t.id !== track.id);
        dispatch(setPlaylistTracks(playlist, newTracklist));
      }
    };
    return [
      <MenuItem onClick={deleteClick} key="Delete">
        <ListItemIcon>
          <Delete />
        </ListItemIcon>
        <ListItemText primary={t("delete")} />
      </MenuItem>,
      <MenuItem
        key="Info"
        component={Link}
        to={`/playlists/${playlistId}/tracks/${track?.id}`}
      >
        <ListItemIcon>
          <Info />
        </ListItemIcon>
        <ListItemText primary={t("info")} />
      </MenuItem>,
    ];
  };

  const clearSelectedTracks = async () => {
    await db.audioBlobs.bulkDelete(Array.from(selected));
    if (playlist) {
      const newTracklist = tracklist.filter((t) => !selected.has(t.id ?? ""));
      dispatch(setPlaylistTracks(playlist, newTracklist));
    }
    closeQueueMenu();
  };

  const onConvertTracksOpen = () => {
    setOpenConvertDialog(true);
  };

  const onConvertTracksClose = () => {
    setOpenConvertDialog(false);
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = (item: Track[] | Playlist) => {
    if (playlist && Array.isArray(item)) {
      dispatch(addPlaylistTracks(playlist, item));
      closeImportDialog();
    }
  };

  const selectedMenuItems = [
    <MenuItem onClick={clearSelectedTracks} key="clear">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary={t("deleteSelectedTracks")} />
    </MenuItem>,
    <MenuItem onClick={onConvertTracksOpen} key="convert">
      <ListItemIcon>
        <Edit />
      </ListItemIcon>
      <ListItemText primary={t("convertSelectedTracks")} />
    </MenuItem>,
  ];

  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== playlistId)
  );

  const { openMenu } = useTrackMenu({
    playlists,
    getListItems,
  });
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
    }
  };

  const menuItems = [
    <MenuItem onClick={openImportDialog} key="import">
      <ListItemIcon>
        <UploadFile />
      </ListItemIcon>
      <ListItemText primary={t("importTrackByUrl")} />
    </MenuItem>,
  ];

  return (
    <>
      <Backdrop open={playlist === false}>
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
            menuItems={menuItems}
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
          <ImportDialog
            open={importDialogOpen}
            handleClose={closeImportDialog}
            parseType="track"
            onSuccess={onImport}
          />
          {openConvertDialog && (
            <ConvertTracksDialog
              playlist={playlist}
              tracks={selectedTracks}
              open={openConvertDialog}
              handleClose={onConvertTracksClose}
            />
          )}
        </>
      ) : (
        <>{playlist !== false && <Typography>{t("notFound")}</Typography>}</>
      )}
    </>
  );
};

export default PlaylistTracks;
