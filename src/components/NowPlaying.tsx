import { Delete, Info, MoreHoriz, PlaylistAdd } from "@mui/icons-material";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { db } from "../database";
import useSelected from "../hooks/useSelected";
import useTrackMenu from "../hooks/useTrackMenu";
import { Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearTracks,
  deleteTrack,
  deleteTracks,
  setTrack,
  setTracks,
} from "../store/reducers/trackReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import SelectTrackListPlugin from "./SelectTrackListPlugin";
import TrackList from "./TrackList";
import PlaylistMenu from "./PlaylistMenu";

const NowPlaying: React.FC = () => {
  const { t } = useTranslation();
  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();

  const getListItems = (track?: Track) => {
    const deleteClick = async () => {
      if (track?.id) {
        await db.audioBlobs.delete(track.id);
      }
      if (track) {
        dispatch(deleteTrack(track));
      }
    };

    return [
      <MenuItem onClick={deleteClick} key="Delete">
        <ListItemIcon>
          <Delete />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </MenuItem>,
      <MenuItem key="Info" component={Link} to={`/track/${track?.id}`}>
        <ListItemIcon>
          <Info />
        </ListItemIcon>
        <ListItemText primary="Info" />
      </MenuItem>,
    ];
  };

  const { openMenu } = useTrackMenu({
    getListItems,
    noQueueItem: true,
  });

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const closeQueueMenu = () => setQueueMenuAnchorEl(null);

  const trackList = useAppSelector((state) => state.track.tracks);

  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(trackList);

  const selectedTracks = trackList.filter((t) => selected.has(t.id ?? ""));

  const clearSelectedTracks = () => {
    dispatch(deleteTracks(selected));
    closeQueueMenu();
  };

  const playlists = useAppSelector((state) => state.playlist.playlists);

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
  };

  const clearQueue = () => {
    dispatch(clearTracks());
  };

  const onDragOver = (newTrackList: Track[]) => {
    dispatch(setTracks(newTrackList));
  };

  const selectedMenuItems = [
    <MenuItem onClick={clearSelectedTracks} key="clear">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary={t("deleteSelectedTracks")} />
    </MenuItem>,
  ];
  const menuItems = [
    <MenuItem onClick={clearQueue} key="clearQueue">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary="Clear All Tracks" />
    </MenuItem>,
  ];

  return (
    <>
      <Typography variant="h3" gutterBottom>
        {t("playQueue")}
      </Typography>
      <IconButton aria-label="clear" onClick={clearQueue}>
        <Tooltip title="Clear All Tracks">
          <Delete fontSize="large" />
        </Tooltip>
      </IconButton>
      <IconButton onClick={openQueueMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      <SelectTrackListPlugin trackList={trackList} setSelected={setSelected} />
      <TrackList
        tracks={trackList}
        openMenu={openMenu}
        onTrackClick={onTrackClick}
        onDragOver={onDragOver}
        onSelect={onSelect}
        isSelected={isSelected}
        onSelectAll={onSelectAll}
        selected={selected}
      />
      <PlaylistMenu
        noQueueItem={true}
        selected={selected}
        tracklist={trackList}
        playlists={playlists}
        selectedMenuItems={selectedMenuItems}
        anchorElement={queueMenuAnchorEl}
        onClose={closeQueueMenu}
        menuItems={menuItems}
      />
    </>
  );
};

export default React.memo(NowPlaying);
