import {
  Album,
  ArrowRight,
  Link as LinkIcon,
  Lyrics,
  Person,
  PlaylistAdd,
  PlaylistPlay,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { NestedMenuItem } from "mui-nested-menu";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import TrackMenuContext, { TrackMenuInterface } from "../TrackMenuContext";
import AddPlaylistDialog from "../components/AddPlaylistDialog";
import PlaylistMenuItem from "../components/PlaylistMenuItem";
import { db } from "../database";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addTrack } from "../store/reducers/trackReducer";

const TrackMenuProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [playlists, setPlaylists] = React.useState<PlaylistInfo[]>([]);
  const [listElements, setListElements] = React.useState<JSX.Element[]>([]);
  const [menuTrack, setMenuTrack] = React.useState<Track>();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const [noQueue, setNoQueue] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(false);
  const closeMenu = () => setAnchorEl(null);
  const dispatch = useAppDispatch();
  const lyricsPluginId = useAppSelector(
    (state) => state.settings.lyricsPluginId
  );
  const { t } = useTranslation();

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
      toast(t("trackAddedToQueue"));
    }
  };

  const favoriteTrack = async () => {
    if (menuTrack) {
      await db.favoriteTracks.add(menuTrack);
      toast(t("addedToFavorites"));
    }
  };

  const removeFavorite = async () => {
    if (menuTrack?.id) {
      await db.favoriteTracks.delete(menuTrack.id);
      toast(t("removedFromFavorites"));
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
        {menuTrack && lyricsPluginId && (
          <MenuItem
            component={Link}
            to={{
              pathname: "/lyrics",
              search:
                `?trackName=${encodeURIComponent(menuTrack.name)}` +
                (menuTrack.artistName
                  ? `&artistName=${menuTrack.artistName}`
                  : ""),
            }}
          >
            <ListItemIcon>
              <Lyrics />
            </ListItemIcon>
            <ListItemText primary={t("lyrics")} />
          </MenuItem>
        )}
        {listElements}
        <MenuItem onClick={addMenuTrackToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary={t("addToNewPlaylist")} />
        </MenuItem>
        {playlists.length > 0 && (
          <NestedMenuItem
            parentMenuOpen={Boolean(anchorEl)}
            label={t("addToPlaylist")}
            rightIcon={<ArrowRight />}
            onClick={(e) => e.stopPropagation()}
          >
            {playlists.map((p) => (
              <PlaylistMenuItem
                key={p.id}
                playlist={p}
                tracks={menuTrack ? [menuTrack] : []}
                closeMenu={closeMenu}
                title={p.name ?? ""}
              />
            ))}
          </NestedMenuItem>
        )}
      </Menu>
      <AddPlaylistDialog
        tracks={menuTrack ? [menuTrack] : []}
        open={playlistDialogOpen}
        setOpen={setPlaylistDialogOpen}
      />
    </TrackMenuContext.Provider>
  );
};

export default TrackMenuProvider;
