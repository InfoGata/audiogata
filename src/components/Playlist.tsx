import { List, RootRef } from "@material-ui/core";
import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { setSongs } from "../store/reducers/playlistReducer";
import { AppState } from "../store/store";
import PlaylistItem from "./PlaylistItem";

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {}

const Playlist: React.FC<IProps> = props => {
  const dispatch = useDispatch();
  const playlist = useSelector((state: AppState) =>
    state.playlist.playlists.find(p => p.id === props.match.params.id),
  );

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

    if (playlist) {
      const tracks = Array.from(playlist.songs);
      const track = tracks.find(s => s.id === draggableId);
      if (track) {
        tracks.splice(source.index, 1);
        tracks.splice(destination.index, 0, track);
        dispatch(setSongs(props.match.params.id, tracks));
      }
    }
  }
  return playlist ? (
    <div>
      {playlist.name}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="playlist">
          {provided => (
            <RootRef rootRef={provided.innerRef}>
              <List>
                {playlist.songs.map((song, index) => (
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

export default Playlist;
