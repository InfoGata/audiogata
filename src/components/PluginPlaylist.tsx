import { PlayCircle, PlaylistAdd } from "@mui/icons-material";
import {
  Backdrop,
  Button,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router";
import { Track, PageInfo, PlaylistInfo } from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import TrackList from "./TrackList";
import useSelected from "../hooks/useSelected";
import { playQueue, setTrack, setTracks } from "../store/reducers/trackReducer";
import { nanoid } from "@reduxjs/toolkit";
import PlaylistMenuItem from "./PlaylistMenuItem";
import AddPlaylistDialog from "./AddPlaylistDialog";

const PluginPlaylist: React.FC = () => {
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginid);
  const [playlistTracks, setPlaylistTracks] = React.useState<Track[]>([]);
  const [page, setPage] = React.useState<PageInfo>();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [menuTrack, setMenuTrack] = React.useState<Track>({} as Track);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [playlistInfo, setPlaylistInfo] = React.useState<PlaylistInfo>();
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(
    playlistTracks || []
  );
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const openPlaylistDialog = () => setPlaylistDialogOpen(true);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const closeMenu = () => setAnchorEl(null);

  const setPlaylistTracksWithIds = (tracks: Track[]) => {
    tracks.forEach((t) => {
      t.id = nanoid();
    });
    setPlaylistTracks(tracks);
  };

  React.useEffect(() => {
    setBackdropOpen(true);
    const getPlaylistTracks = async () => {
      if (plugin && (await plugin.hasDefined.onGetPlaylistTracks())) {
        const t = await plugin.remote.onGetPlaylistTracks({
          playlist: {
            apiId: id,
            isUserPlaylist: true,
          },
        });

        setPlaylistTracksWithIds(t.items);
        setPlaylistInfo(t.playlist);
        setPage(t.pageInfo);
        setBackdropOpen(false);
      }
    };

    getPlaylistTracks();
  }, [plugin, id]);

  const onPlayClick = () => {
    dispatch(setTracks(playlistTracks));
    dispatch(playQueue());
  };

  const addToNewPlaylist = () => {
    openPlaylistDialog();
    closeMenu();
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
  };

  const pageButtons = () => {
    if (!page) return;

    const hasPrev = page.offset !== 0;
    const nextOffset = page.offset + page.resultsPerPage;
    const hasNext = nextOffset < page.totalResults;

    const onPrev = async () => {
      if (!plugin) {
        return;
      }
      setBackdropOpen(true);
      const prevOffset = page.offset - page.resultsPerPage;
      const newPage: PageInfo = {
        offset: prevOffset,
        totalResults: page.totalResults,
        resultsPerPage: page.resultsPerPage,
        prevPage: page.prevPage,
      };
      const t = await plugin.remote.onGetPlaylistTracks({
        playlist: {
          apiId: id,
          isUserPlaylist: true,
        },
        page: newPage,
      });
      setPlaylistTracksWithIds(t.items);
      setPage(t.pageInfo);

      setBackdropOpen(false);
    };

    const onNext = async () => {
      if (!plugin) {
        return;
      }
      setBackdropOpen(true);
      const newPage: PageInfo = {
        offset: nextOffset,
        totalResults: page.totalResults,
        resultsPerPage: page.resultsPerPage,
        nextPage: page.nextPage,
      };

      const t = await plugin.remote.onGetPlaylistTracks({
        playlist: {
          apiId: id,
          isUserPlaylist: true,
        },
        page: newPage,
      });
      setPlaylistTracksWithIds(t.items);
      setPage(t.pageInfo);
      setBackdropOpen(false);
    };

    return (
      <>
        {hasPrev && <Button onClick={onPrev}>Prev</Button>}
        {hasNext && <Button onClick={onNext}>Next</Button>}
      </>
    );
  };

  const onTrackClick = (track: Track) => {
    dispatch(setTracks(playlistTracks));
    dispatch(setTrack(track));
  };

  return (
    <>
      <Backdrop open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h3">{playlistInfo?.name}</Typography>
      <IconButton size="large" onClick={onPlayClick}>
        <PlayCircle color="success" sx={{ fontSize: 45 }} />
      </IconButton>
      <TrackList
        tracks={playlistTracks}
        openMenu={openMenu}
        onTrackClick={onTrackClick}
        onSelect={onSelect}
        isSelected={isSelected}
        onSelectAll={onSelectAll}
        selected={selected}
        dragDisabled={true}
      />
      <AddPlaylistDialog
        tracks={[menuTrack]}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
      {page && pageButtons()}
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
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
            tracks={[menuTrack]}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
    </>
  );
};

export default PluginPlaylist;
