import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExtensionIcon from "@material-ui/icons/Extension";
import HomeIcon from "@material-ui/icons/Home";
import MenuIcon from "@material-ui/icons/Menu";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import SyncIcon from "@material-ui/icons/Sync";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";
import { IPlaylist } from "../services/data/database";
import { deletePlaylist } from "../store/actions/playlist";
import { AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";

interface IProps extends StateProps, DispatchProps {}

interface IPlaylistProps {
  playlist: IPlaylist;
  deletePlaylist: (playlist: IPlaylist) => void;
}

const PlaylistItem = (props: IPlaylistProps) => {
  function deletePlaylistItem() {
    props.deletePlaylist(props.playlist);
  }
  return (
    <ListItem button={true} key={props.playlist.id}>
      <ListItemText primary={props.playlist.name} />
      <ListItemSecondaryAction>
        <IconButton aria-label="Delete" onClick={deletePlaylistItem}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const linkToHome = (props: any) => {
  return <Link to="/" {...props} />;
};

const linkToPlugins = (props: any) => {
  return <Link to="/plugins" {...props} />;
};

const linkToSync = (props: any) => {
  return <Link to="/sync" {...props} />;
};

const Navigation = (props: IProps) => {
  const [playlistOpen, setPlaylistOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  function handlePlaylistClick() {
    setPlaylistOpen(!playlistOpen);
  }
  function openDialog() {
    setDialogOpen(true);
  }
  function closeDialog() {
    setDialogOpen(false);
  }

  const playlistItems = props.playlists.map(p => (
    <PlaylistItem playlist={p} deletePlaylist={props.deletePlaylist} />
  ));
  return (
    <List>
      <ListItem button={true} component={linkToHome} key="Home">
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText>Home</ListItemText>
      </ListItem>
      <ListItem button={true} component={linkToPlugins} key="Plugins">
        <ListItemIcon>
          <ExtensionIcon />
        </ListItemIcon>
        <ListItemText>Plugins</ListItemText>
      </ListItem>
      <ListItem button={true} component={linkToSync} key="Sync">
        <ListItemIcon>
          <SyncIcon />
        </ListItemIcon>
        <ListItemText>Sync</ListItemText>
      </ListItem>
      <ListItem button={true} key="Playlists" onClick={handlePlaylistClick}>
        <ListItemIcon>
          <MenuIcon />
        </ListItemIcon>
        <ListItemText>Playlists</ListItemText>
        {playlistOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={playlistOpen} timeout="auto" unmountOnExit={true}>
        <List component="span">
          <ListItem button={true} onClick={openDialog}>
            <ListItemText primary="Add Playlist" />
            <ListItemSecondaryAction>
              <IconButton aria-label="Add" onClick={openDialog}>
                <PlaylistAddIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {playlistItems}
        </List>
        <AddPlaylistDialog handleClose={closeDialog} open={dialogOpen} />
      </Collapse>
    </List>
  );
};

const mapStateToProps = (state: AppState) => ({
  playlists: state.playlist.playlists,
});
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      deletePlaylist,
    },
    dispatch,
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigation);
export default connectedComponent;
