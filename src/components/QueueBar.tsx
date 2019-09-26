import {
  Divider,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
} from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { clearTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import PlayQueue from "./PlayQueue";

const drawerWidth = 300;

const useStyles = makeStyles(theme => ({
  drawer: {
    flexShrink: 0,
    width: drawerWidth,
  },
  drawerHeader: {
    alignItems: "center",
    display: "flex",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  },
  drawerPaper: {
    width: drawerWidth,
  },
}));

interface IProps {
  onDeleteClick: (song: ISong) => void;
  onPlaylistClick: (song: ISong) => void;
}

const QueueBar: React.FC<IProps> = props => {
  const classes = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const songs = useSelector((state: AppState) => state.song.songs);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function openMenu(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function closeMenu() {
    setAnchorEl(null);
  }
  function clearQueue() {
    dispatch(clearTracks());
  }
  function openDialog() {
    setDialogOpen(true);
  }
  function addToNewPlaylist() {
    openDialog();
    closeMenu();
  }
  function closeDialog() {
    setDialogOpen(false);
  }
  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={true}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <button onClick={openMenu}>Save</button>
        <button onClick={clearQueue}>Clear</button>
      </div>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAddIcon />
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
      <PlayQueue
        songList={songs}
        currentSong={currentSong}
        onDeleteClick={props.onDeleteClick}
        onPlaylistClick={props.onPlaylistClick}
      />
    </Drawer>
  );
};

export default QueueBar;
