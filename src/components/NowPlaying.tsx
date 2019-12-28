import { List, RootRef } from "@material-ui/core";
import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import QueueItem from "./QueueItem";

const PlayQueue: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const songList = useSelector((state: AppState) => state.song.songs);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const onDragEnd = (result: DropResult) => {
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

    const tracks = Array.from(songList);
    const track = tracks.find(s => s.id === draggableId);
    if (track) {
      tracks.splice(source.index, 1);
      tracks.splice(destination.index, 0, track);
      dispatch(setTracks(tracks));
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="song-queue">
        {provided => (
          <RootRef rootRef={provided.innerRef}>
            <List>
              {songList.map((songInfo, index) => (
                <QueueItem
                  key={songInfo.id}
                  index={index}
                  song={songInfo}
                  currentSong={currentSong}
                />
              ))}
              {provided.placeholder}
            </List>
          </RootRef>
        )}
      </Droppable>
    </DragDropContext>
  );
};
export default React.memo(PlayQueue);
