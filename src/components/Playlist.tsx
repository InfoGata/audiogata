import { List, RootRef } from "@material-ui/core";
import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { bindActionCreators, Dispatch } from "redux";
import { setSongs } from "../store/actions/playlist";
import { AppState } from "../store/store";
import PlaylistItem from "./PlaylistItem";

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {}

const Playlist: React.FC<IProps & StateProps & DispatchProps> = props => {
  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const tracks = Array.from(props.playlist.songs);
    const track = tracks.find(s => s.id === draggableId);
    if (track) {
      tracks.splice(source.index, 1);
      tracks.splice(destination.index, 0, track);
      props.setSongs(props.match.params.id, tracks);
    }
  }
  return props.playlist ? (
    <div>
      {props.playlist.name}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="playlist">
          {provided => (
            <RootRef rootRef={provided.innerRef}>
              <List>
                {props.playlist.songs.map((song, index) => (
                  <PlaylistItem key={song.id} index={index} song={song} />
                ))}
              </List>
            </RootRef>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  ) : (
    <div>Not Found</div>
  );
};

const mapStateToProps = (state: AppState, ownProps: IProps) => ({
  playlist: state.playlist.playlists.filter(
    p => p.id === ownProps.match.params.id,
  )[0],
});
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      setSongs,
    },
    dispatch,
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Playlist);

export default connectedComponent;
