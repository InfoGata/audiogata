import { List, ListItem, ListItemText } from "@material-ui/core";
import React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { bindActionCreators, Dispatch } from "redux";
import { AppState } from "../store/store";

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {}

const Playlist = (props: IProps & StateProps) => {
  return (
    <div>
      {props.playlist.name}
      <List>
        {props.playlist.songs.map(s => (
          <ListItem key={s.id}>
            <ListItemText primary={s.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

const mapStateToProps = (state: AppState, ownProps: IProps) => ({
  playlist: state.playlist.playlists.filter(
    p => p.id === ownProps.match.params.id,
  )[0],
});
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Playlist);

export default connectedComponent;
