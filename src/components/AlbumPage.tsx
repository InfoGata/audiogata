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
import { useParams } from "react-router-dom";
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
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins, pluginsLoaded } = usePlugins();
  const [albumInfo, setAlbumInfo] = React.useState<Album>();
  const [menuTrack, setMenuTrack] = React.useState<Track>({} as Track);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const dispatch = useAppDispatch();
  const onGetAlbum = async () => {
    const plugin = plugins.find((p) => p.id === pluginid);
    if (plugin && (await plugin.hasDefined.onGetAlbumTracks())) {
      const albumData = await plugin.remote.onGetAlbumTracks({
        apiId: id,
      });
      setAlbumInfo(albumData.album);

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

  const query = useQuery(["albumpage", pluginid, id], onGetAlbum, {
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
            `/plugins/${pluginid}/artists/${albumInfo.artistApiId}`
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
            tracks={[menuTrack]}
            closeMenu={closeMenu}
            namePrefix="Add track to "
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        tracks={[menuTrack]}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default AlbumPage;
