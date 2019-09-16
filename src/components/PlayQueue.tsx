import { List, RootRef } from "@material-ui/core";
import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { ISong } from "../services/data/database";
import QueueItem from "./QueueItem";

interface IProps {
  songList: ISong[];
  currentSong?: ISong;
  onDeleteClick: (song: ISong) => void;
  onPlaylistClick: (song: ISong) => void;
  setTracks: (tracks: ISong[]) => void;
}

const PlayQueue = (props: IProps) => {
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

    const tracks = Array.from(props.songList);
    const track = tracks.find(s => s.id === draggableId);
    if (track) {
      tracks.splice(source.index, 1);
      tracks.splice(destination.index, 0, track);
      props.setTracks(tracks);
    }
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="song-queue">
        {provided => (
          <RootRef rootRef={provided.innerRef}>
            <List>
              {props.songList.map((songInfo, index) => (
                <QueueItem
                  key={songInfo.id}
                  index={index}
                  song={songInfo}
                  currentSong={props.currentSong}
                  onDeleteClick={props.onDeleteClick}
                  onPlaylistClick={props.onPlaylistClick}
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
