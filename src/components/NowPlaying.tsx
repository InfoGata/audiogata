import React from "react";
import { useSelector } from "react-redux";
import {
  List,
  ListRowProps,
  WindowScroller,
  AutoSizer,
} from "react-virtualized";
import { ISong } from "../models";
import { AppState } from "../store/store";
import QueueItem from "./QueueItem";

const rowRenderer = (songs: ISong[]) => (props: ListRowProps) => {
  const { index, style } = props;
  const song = songs[index];
  return <QueueItem song={song} style={style} />;
};

const PlayQueue: React.FC = () => {
  const songList = useSelector((state: AppState) => state.song.songs);
  // const onDragEnd = (result: DropResult) => {
  //   const { destination, source, draggableId } = result;

  //   if (!destination) {
  //     return;
  //   }

  //   if (
  //     destination.droppableId === source.droppableId &&
  //     destination.index === source.index
  //   ) {
  //     return;
  //   }

  //   const tracks = Array.from(songList);
  //   const track = tracks.find(s => s.id === draggableId);
  //   if (track) {
  //     tracks.splice(source.index, 1);
  //     tracks.splice(destination.index, 0, track);
  //     dispatch(setTracks(tracks));
  //   }
  // };

  return (
    <WindowScroller>
      {({ height, isScrolling, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight={true}>
          {({ width }) => (
            <List
              autoHeight={true}
              height={height}
              width={width}
              rowCount={songList.length}
              rowHeight={45}
              rowRenderer={rowRenderer(songList)}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
            />
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
};
export default React.memo(PlayQueue);
