import {
  Backdrop,
  IconButton,
  CircularProgress,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router";
import {
  deleteTrack,
  setTrack,
  setTracks,
} from "../store/reducers/songReducer";
import { db } from "../database";
import { IPlaylist, Song } from "../types";
import { useAppDispatch } from "../store/hooks";
import { setPlaylistTracks } from "../store/reducers/playlistReducer";
import { Delete, Info, PlayCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { downloadTrack } from "../store/reducers/downloadReducer";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";

const Playlist: React.FC = () => {
  const { id } = useParams<"id">();
  const dispatch = useAppDispatch();
  const [playlist, setPlaylist] = React.useState<IPlaylist | undefined>();
  const [loaded, setLoaded] = React.useState(false);
  const [menuSong, setMenuSong] = React.useState<Song>({} as Song);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hasBlob, setHasBlob] = React.useState(false);
  const [canOffline, setCanOffline] = React.useState(false);
  const { plugins } = usePlugins();
  const infoPath = `/track/${menuSong.id}`;
  const closeMenu = () => setAnchorEl(null);
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(
    playlist?.songs || []
  );

  React.useEffect(() => {
    const getPlaylist = async () => {
      if (id) {
        setPlaylist(await db.playlists.get(id));
        setLoaded(true);
      }
    };
    getPlaylist();
  }, [id]);

  const playPlaylist = () => {
    if (!playlist) {
      return;
    }

    const firstSong = playlist.songs[0];
    dispatch(setTrack(firstSong));
    dispatch(setTracks(playlist.songs));
  };

  const openMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    song: Song
  ) => {
    const currentTarget = event.currentTarget;
    event.stopPropagation();
    event.preventDefault();
    setMenuSong(song);
    setAnchorEl(currentTarget);
    // Check whether song can be played offline
    if (song.id && song.from) {
      // Check if this needs it's own player
      // Instead of being able to play locally
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

  const deleteClick = async () => {
    if (menuSong.id) {
      await db.audioBlobs.delete(menuSong.id);
    }
    dispatch(deleteTrack(menuSong));
    closeMenu();
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

  const onTrackClick = (track: Song) => {
    dispatch(setTrack(track));
    dispatch(setTracks(playlist?.songs || []));
  };

  const onDragOver = (trackList: Song[]) => {
    dispatch(setPlaylistTracks(playlist, trackList));

    const newPlaylist: IPlaylist = { ...playlist, songs: trackList };
    setPlaylist(newPlaylist);
  };

  return (
    <>
      <Backdrop open={!loaded}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {playlist ? (
        <>
          <div>{playlist.name}</div>
          <IconButton size="large" onClick={playPlaylist}>
            <PlayCircle color="success" sx={{ fontSize: 45 }} />
          </IconButton>
          <TrackList
            tracks={playlist.songs}
            openMenu={openMenu}
            onTrackClick={onTrackClick}
            onDragOver={onDragOver}
            onSelect={onSelect}
            isSelected={isSelected}
            onSelectAll={onSelectAll}
            selected={selected}
          />
          <Menu
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorEl={anchorEl}
          >
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
          </Menu>
        </>
      ) : (
        <>{loaded && <Typography>Not Found</Typography>}</>
      )}
    </>
  );
};

export default Playlist;
