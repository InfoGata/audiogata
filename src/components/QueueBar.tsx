import {
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ChevronRight, PlaylistAdd } from "@material-ui/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearTracks } from "../store/reducers/songReducer";
import { toggleQueuebar } from "../store/reducers/uiReducer";
import { AppDispatch, AppState } from "../store/store";
import { queuebarWidth } from "../utils";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import PlayQueue from "./PlayQueue";

const useStyles = makeStyles(theme => ({
  drawer: {
    flexShrink: 0,
    width: queuebarWidth,
  },
  drawerHeader: {
    alignItems: "center",
    display: "flex",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  },
  drawerPaper: {
    width: queuebarWidth,
  },
}));

const QueueBar: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const songs = useSelector((state: AppState) => state.song.songs);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const queuebarOpen = useSelector((state: AppState) => state.ui.queuebarOpen);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const clearQueue = () => dispatch(clearTracks());
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);
  const addToNewPlaylist = () => {
    openDialog();
    closeMenu();
  };
  const handleDrawerClose = () => dispatch(toggleQueuebar());

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={queuebarOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronRight />
        </IconButton>
        <button onClick={openMenu}>Save</button>
        <button onClick={clearQueue}>Clear</button>
      </div>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map(p => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            songs={songs}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        songs={songs}
        open={dialogOpen}
        handleClose={closeDialog}
      />
      <Divider />
      <PlayQueue songList={songs} currentSong={currentSong} />
    </Drawer>
  );
};

export default QueueBar;
