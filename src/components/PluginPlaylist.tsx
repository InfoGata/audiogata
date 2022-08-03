import {
  MoreHoriz,
  PlayCircle,
  PlaylistAdd,
  PlaylistPlay,
} from "@mui/icons-material";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Grid,
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
import {
  addTracks,
  playQueue,
  setTrack,
  setTracks,
} from "../store/reducers/trackReducer";
import { nanoid } from "@reduxjs/toolkit";
import PlaylistMenuItem from "./PlaylistMenuItem";
import AddPlaylistDialog from "./AddPlaylistDialog";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import { useLocation } from "react-router-dom";
import thumbnail from "../thumbnail.png";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

const PluginPlaylist: React.FC = () => {
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginid);
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const [menuTrack, setMenuTrack] = React.useState<Track>({} as Track);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [playlistInfo, setPlaylistInfo] = React.useState<PlaylistInfo>();
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const getPlaylistTracks = async () => {
    if (plugin && (await plugin.hasDefined.onGetPlaylistTracks())) {
      const t = await plugin.remote.onGetPlaylistTracks({
        apiId: id,
        isUserPlaylist: params.has("isuserplaylist"),
        page,
      });

      setPlaylistInfo(t.playlist);
      setCurrentPage(t.pageInfo);
      t.items.forEach((t) => {
        t.id = nanoid();
      });
      return t.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginid, id, page],
    getPlaylistTracks,
    { enabled: pluginsLoaded }
  );
  const tracklist = query.data ?? [];
  const { onSelect, onSelectAll, isSelected, selected } =
    useSelected(tracklist);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const openPlaylistDialog = () => setPlaylistDialogOpen(true);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const closeQueueMenu = () => setQueueMenuAnchorEl(null);

  const selectedTracks = tracklist.filter((t) => selected.has(t.id ?? ""));

  const addPlaylistToQueue = () => {
    dispatch(addTracks(tracklist));
    closeQueueMenu();
  };

  const addSelectedToQueue = () => {
    dispatch(addTracks(selectedTracks));
    closeQueueMenu();
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

  const onTrackClick = (track: Track) => {
    dispatch(setTracks(tracklist));
    dispatch(setTrack(track));
  };

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

  const playlistCard = (
    <Card sx={{ display: "flex" }}>
      <CardMedia
        component="img"
        alt={playlistInfo?.name}
        image={getThumbnailImage(playlistInfo?.images, playlistThumbnailSize)}
        onError={onImageError}
        sx={{ height: "200px", width: "200px" }}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography component="div" variant="h5">
            {playlistInfo?.name}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {playlistInfo && playlistCard}
      <IconButton size="large" onClick={onPlayClick}>
        <PlayCircle color="success" sx={{ fontSize: 45 }} />
      </IconButton>
      <IconButton onClick={openQueueMenu}>
        <MoreHoriz fontSize="large" />
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
      <AddPlaylistDialog
        tracks={[menuTrack]}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
      <Grid>
        {hasPreviousPage && <Button onClick={onPreviousPage}>Previous</Button>}
        {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
      </Grid>
      <Menu
        open={Boolean(queueMenuAnchorEl)}
        onClose={closeQueueMenu}
        anchorEl={queueMenuAnchorEl}
      >
        <MenuItem onClick={addPlaylistToQueue}>
          <ListItemIcon>
            <PlaylistPlay />
          </ListItemIcon>
          <ListItemText primary="Add Tracks To Queue" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={tracklist}
            closeMenu={closeQueueMenu}
            namePrefix="Add Tracks to "
          />
        ))}
        {selected.size > 0 && [
          <Divider key="divider" />,
          <MenuItem onClick={addSelectedToQueue} key="add">
            <ListItemIcon>
              <PlaylistPlay />
            </ListItemIcon>
            <ListItemText primary="Add Selected To Queue" />
          </MenuItem>,
          playlists.map((p) => (
            <PlaylistMenuItem
              key={p.id}
              playlist={p}
              tracks={selectedTracks}
              closeMenu={closeQueueMenu}
              namePrefix="Add Selected to "
            />
          )),
        ]}
      </Menu>
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
            namePrefix="Add track to "
          />
        ))}
      </Menu>
    </>
  );
};

export default PluginPlaylist;
