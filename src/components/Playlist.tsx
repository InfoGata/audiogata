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
} from "../store/reducers/trackReducer";
import { db } from "../database";
import { Playlist, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { setPlaylistTracks } from "../store/reducers/playlistReducer";
import { Delete, Info, PlayCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { downloadTrack } from "../store/reducers/downloadReducer";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";

const PlaylistTracks: React.FC = () => {
  const { id } = useParams<"id">();
  const dispatch = useAppDispatch();
  const [playlist, setPlaylist] = React.useState<Playlist | undefined>();
  const [loaded, setLoaded] = React.useState(false);
  const [menuTrack, setMenuTrack] = React.useState<Track>({} as Track);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hasBlob, setHasBlob] = React.useState(false);
  const [canOffline, setCanOffline] = React.useState(false);
  const { plugins } = usePlugins();
  const infoPath = `/track/${menuTrack.id}`;
  const closeMenu = () => setAnchorEl(null);
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(
    playlist?.tracks || []
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

    const firstTrack = playlist.tracks[0];
    dispatch(setTrack(firstTrack));
    dispatch(setTracks(playlist.tracks));
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
    if (track.id && track.from) {
      // Check if this needs it's own player
      // Instead of being able to play locally
      const pluginFrame = plugins.find((p) => p.id === track.from);
      const canDownload =
        (await pluginFrame?.hasDefined.getTrackUrl()) || false;
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
    dispatch(deleteTrack(menuTrack));
    closeMenu();
  };

  const enablePlayingOffline = async () => {
    try {
      if (menuTrack.from) {
        const pluginFrame = plugins.find((p) => p.id === menuTrack.from);
        if (!(await pluginFrame?.hasDefined.getTrackUrl())) {
          return;
        }

        const source = await pluginFrame?.remote.getTrackUrl(menuTrack);
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
    dispatch(setTracks(playlist?.tracks || []));
  };

  const onDragOver = (trackList: Track[]) => {
    dispatch(setPlaylistTracks(playlist, trackList));

    const newPlaylist: Playlist = { ...playlist, tracks: trackList };
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
            tracks={playlist.tracks}
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

export default PlaylistTracks;
