import { PlayCircle, PlaylistAdd } from "@mui/icons-material";
import {
  Backdrop,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import useSelected from "../hooks/useSelected";
import { usePlugins } from "../PluginsContext";
import { Album, Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTracks, setTrack, playQueue } from "../store/reducers/trackReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistInfoCard from "./PlaylistInfoCard";
import PlaylistMenuItem from "./PlaylistMenuItem";
import TrackList from "./TrackList";

const AlbumPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useLocation().state as Album | null;
  const [albumInfo, setAlbumInfo] = React.useState<Album | null>(state);
  const [menuTrack, setMenuTrack] = React.useState<Track>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const dispatch = useAppDispatch();
  const onGetAlbum = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onGetAlbumTracks())) {
      const albumData = await plugin.remote.onGetAlbumTracks({
        apiId: apiId,
      });
      if (albumData.album) {
        setAlbumInfo(albumData.album);
      }

      albumData.items.forEach((t) => {
        t.id = nanoid();
      });
      return albumData.items;
    }
    return [];
  };

  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const openPlaylistDialog = () => setPlaylistDialogOpen(true);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const query = useQuery(["albumpage", pluginId, apiId], onGetAlbum, {
    enabled: pluginsLoaded,
  });
  const tracklist = query.data || [];
  const { onSelect, onSelectAll, isSelected, selected } = useSelected(
    query.data || []
  );

  const onTrackClick = (track: Track) => {
    dispatch(setTracks(tracklist));
    dispatch(setTrack(track));
  };

  const closeMenu = () => setAnchorEl(null);

  const onPlayClick = () => {
    dispatch(setTracks(tracklist));
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

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {albumInfo && (
        <PlaylistInfoCard
          name={albumInfo.name || ""}
          subtitle={albumInfo.artistName}
          subtitleLink={
            albumInfo.artistApiId &&
            `/plugins/${pluginId}/artists/${albumInfo.artistApiId}`
          }
          images={albumInfo.images}
        />
      )}
      <IconButton size="large" onClick={onPlayClick}>
        <PlayCircle color="success" sx={{ fontSize: 45 }} />
      </IconButton>
      <TrackList
        tracks={tracklist}
        openMenu={openMenu}
        onTrackClick={onTrackClick}
        onSelect={onSelect}
        isSelected={isSelected}
        onSelectAll={onSelectAll}
        selected={selected}
        dragDisabled={true}
      />
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.apiId}
            playlist={p}
            tracks={menuTrack ? [menuTrack] : []}
            closeMenu={closeMenu}
            namePrefix="Add track to "
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        tracks={menuTrack ? [menuTrack] : []}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default AlbumPage;
