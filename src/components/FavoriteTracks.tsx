import { MoreHoriz, PlayCircle, UploadFile } from "@mui/icons-material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { db } from "../database";
import useTrackMenu from "../hooks/useTrackMenu";
import { Playlist, Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { playQueue, setTrack, setTracks } from "../store/reducers/trackReducer";
import ImportDialog from "./ImportDialog";
import PlaylistMenu from "./PlaylistMenu";
import Spinner from "./Spinner";
import TrackList from "./TrackList";

const FavoriteTracks: React.FC = () => {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { t } = useTranslation();
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [favoritesMenuAnchorEl, setFavoriteseMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const { openMenu } = useTrackMenu();
  const tracks = useLiveQuery(() => db.favoriteTracks.toArray());

  const openFavoritesMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFavoriteseMenuAnchorEl(event.currentTarget);
  };

  const closeFavoritesMenu = () => {
    setFavoriteseMenuAnchorEl(null);
  };

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
    dispatch(setTracks(tracks || []));
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = async (item: Track[] | Playlist) => {
    if (Array.isArray(item)) {
      await db.favoriteTracks.bulkAdd(item);
      closeImportDialog();
    }
  };

  const onPlay = () => {
    if (!tracks) return;
    dispatch(setTracks(tracks));
    dispatch(playQueue());
  };

  const menuItems = [
    <MenuItem onClick={openImportDialog} key="import">
      <ListItemIcon>
        <UploadFile />
      </ListItemIcon>
      <ListItemText primary={t("importTrackByUrl")} />
    </MenuItem>,
  ];

  if (!tracks) {
    return <Spinner />;
  }

  return (
    <>
      <IconButton size="large" onClick={onPlay}>
        <PlayCircle color="success" sx={{ fontSize: 45 }} />
      </IconButton>
      <IconButton onClick={openFavoritesMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      <TrackList
        tracks={tracks || []}
        openMenu={openMenu}
        onTrackClick={onTrackClick}
      />
      <ImportDialog
        open={importDialogOpen}
        handleClose={closeImportDialog}
        parseType="track"
        onSuccess={onImport}
      />
      <PlaylistMenu
        playlists={playlists}
        tracklist={tracks ?? []}
        anchorElement={favoritesMenuAnchorEl}
        onClose={closeFavoritesMenu}
        menuItems={menuItems}
      />
    </>
  );
};

export default FavoriteTracks;
