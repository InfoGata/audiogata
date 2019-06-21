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
import SyncIcon from "@material-ui/icons/Sync";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";
import { deletePlaylist } from "../store/actions/playlist";
import { AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";

interface IState {
  playlistOpen: boolean;
  openDialog: boolean;
}

interface IProps extends StateProps, DispatchProps {}

class Navigation extends React.PureComponent<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      openDialog: false,
      playlistOpen: false,
    };
  }

  public render() {
    const playlistItems = this.props.playlists.map(p => (
      <ListItem button={true} key={p.id}>
        <ListItemText primary={p.name} />
        <ListItemSecondaryAction>
          <IconButton
            aria-label="Delete"
            onClick={this.props.deletePlaylist.bind(this, p)}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ));
    return (
      <List>
        <ListItem button={true} component={this.linkToHome} key="Home">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>Home</ListItemText>
        </ListItem>
        <ListItem button={true} component={this.linkToPlugins} key="Plugins">
          <ListItemIcon>
            <ExtensionIcon />
          </ListItemIcon>
          <ListItemText>Plugins</ListItemText>
        </ListItem>
        <ListItem button={true} component={this.linkToSync} key="Sync">
          <ListItemIcon>
            <SyncIcon />
          </ListItemIcon>
          <ListItemText>Sync</ListItemText>
        </ListItem>
        <ListItem
          button={true}
          key="Playlists"
          onClick={this.handlePlaylistClick}
        >
          <ListItemIcon>
            <MenuIcon />
          </ListItemIcon>
          <ListItemText>Playlists</ListItemText>
          {this.state.playlistOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse
          in={this.state.playlistOpen}
          timeout="auto"
          unmountOnExit={true}
        >
          <List component="span">
            <ListItem button={true} onClick={this.handleDialogOpen}>
              <ListItemText primary="Add Playlist" />
              <ListItemSecondaryAction>
                <IconButton aria-label="Add" onClick={this.handleDialogOpen}>
                  <PlaylistAddIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {playlistItems}
          </List>
          <AddPlaylistDialog
            handleClose={this.handleDialogClose}
            open={this.state.openDialog}
          />
        </Collapse>
      </List>
    );
  }

  private handlePlaylistClick = () => {
    this.setState(state => ({
      playlistOpen: !state.playlistOpen,
    }));
  };

  private linkToHome = (props: any) => {
    return <Link to="/" {...props} />;
  };

  private linkToPlugins = (props: any) => {
    return <Link to="/plugins" {...props} />;
  };

  private linkToSync = (props: any) => {
    return <Link to="/sync" {...props} />;
  };

  private handleDialogOpen = () => {
    this.setState({
      openDialog: true,
    });
  };

  private handleDialogClose = () => {
    this.setState({
      openDialog: false,
    });
  };
}

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
