import React from "react";
import {
  Album,
  Person,
  PlaylistAdd,
  PlaylistPlay,
  Star,
  StarBorder,
  Link as LinkIcon,
} from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AddPlaylistDialog from "../components/AddPlaylistDialog";
import PlaylistMenuItem from "../components/PlaylistMenuItem";
import { useAppDispatch } from "../store/hooks";
import { addTrack } from "../store/reducers/trackReducer";
import { db } from "../database";
import { useSnackbar } from "notistack";
import { PlaylistInfo, Track } from "../plugintypes";
import TrackMenuContext, { TrackMenuInterface } from "../TrackMenuContext";

const TrackMenuProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [playlists, setPlaylists] = React.useState<PlaylistInfo[]>([]);
  const [listElements, setListElements] = React.useState<JSX.Element[]>([]);
  const [menuTrack, setMenuTrack] = React.useState<Track>();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const [noQueue, setNoQueue] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(false);
  const closeMenu = () => setAnchorEl(null);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const openTrackMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setMenuTrack(track);
    if (track.pluginId && track.apiId) {
      const hasFavorite = await db.favoriteTracks.get({
        pluginId: track.pluginId,
        apiId: track.apiId,
      });
      setIsFavorited(!!hasFavorite);
    } else if (track.id) {
      const hasFavorite = await db.favoriteTracks.get(track.id);
      setIsFavorited(!!hasFavorite);
    } else {
      setIsFavorited(false);
    }
  };

  const addMenuTrackToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
  };

  const addTrackToQueue = () => {
    if (menuTrack) {
      dispatch(addTrack(menuTrack));
      enqueueSnackbar(t("trackAddedToQueue"));
    }
  };

  const favoriteTrack = async () => {
    if (menuTrack) {
      await db.favoriteTracks.add(menuTrack);
      enqueueSnackbar(t("addedToFavorites"));
    }
  };

  const removeFavorite = async () => {
    if (menuTrack?.id) {
      await db.favoriteTracks.delete(menuTrack.id);
      enqueueSnackbar(t("removedFromFavorites"));
    }
  };

  const defaultContext: TrackMenuInterface = {
    openTrackMenu,
    setPlaylists,
    setListElements,
    setNoQueue,
  };

  return (
    <TrackMenuContext.Provider value={defaultContext}>
      {props.children}
      <Menu
        open={Boolean(anchorEl)}
        onClick={closeMenu}
        onClose={closeMenu}
        anchorEl={anchorEl}
      >
        {!noQueue && (
          <MenuItem onClick={addTrackToQueue}>
            <ListItemIcon>
              <PlaylistPlay />
            </ListItemIcon>
            <ListItemText primary={t("addToQueue")} />
          </MenuItem>
        )}
        <MenuItem onClick={isFavorited ? removeFavorite : favoriteTrack}>
          <ListItemIcon>{isFavorited ? <StarBorder /> : <Star />}</ListItemIcon>
          <ListItemText
            primary={
              isFavorited ? t("removeFromFavorites") : t("addToFavorites")
            }
          />
        </MenuItem>
        {menuTrack?.albumApiId && (
          <MenuItem
            component={Link}
            to={`/plugins/${menuTrack.pluginId}/albums/${menuTrack.albumApiId}`}
          >
            <ListItemIcon>
              <Album />
            </ListItemIcon>
            <ListItemText primary={t("goToAlbum")} />
          </MenuItem>
        )}
        {menuTrack?.artistApiId && (
          <MenuItem
            component={Link}
            to={`/plugins/${menuTrack.pluginId}/artists/${menuTrack.artistApiId}`}
          >
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary={t("goToArtist")} />
          </MenuItem>
        )}
        {menuTrack?.originalUrl && (
          <MenuItem component="a" href={menuTrack.originalUrl} target="_blank">
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText primary={t("originalUrl")} />
          </MenuItem>
        )}
        {listElements}
        <MenuItem onClick={addMenuTrackToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary={t("addToNewPlaylist")} />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={menuTrack ? [menuTrack] : []}
            closeMenu={closeMenu}
            title={t("addToPlaylist", { playlistName: p.name })}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        tracks={menuTrack ? [menuTrack] : []}
        handleClose={closePlaylistDialog}
        open={playlistDialogOpen}
      />
    </TrackMenuContext.Provider>
  );
};

export default TrackMenuProvider;
