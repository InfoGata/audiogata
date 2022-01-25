import { Button, List } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import PlaylistItem from "./PlaylistItem";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  SortableContext,
  arrayMove,
} from "@dnd-kit/sortable";
import { setSongs } from "../store/reducers/playlistReducer";

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {}

const Playlist: React.FC<IProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const playlist = useSelector((state: AppState) =>
    state.playlist.playlists.find((p) => p.id === props.match.params.id)
  );
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const playPlaylist = () => {
    if (!playlist) {
      return;
    }

    const firstSong = playlist.songs[0];
    dispatch(setTrack(firstSong));
    dispatch(setTracks(playlist.songs));
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (playlist && active.id !== over?.id) {
      const oldIndex = playlist.songs.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = playlist.songs.findIndex((item) => item.id === over?.id);
      const newList = arrayMove(playlist.songs, oldIndex, newIndex);
      dispatch(setSongs(props.match.params.id, newList));
    }
  };
  return playlist ? (
    <DndContext sensors={sensors} onDragEnd={handleDragOver}>
      <div>{playlist.name}</div>
      <Button onClick={playPlaylist}>Play</Button>
      <List>
        <SortableContext items={playlist.songs.map((s) => s.id || "")}>
          {playlist.songs.map((s) => (
            <PlaylistItem
              key={s.id}
              song={s}
              currentSong={currentSong}
              playlist={playlist}
            />
          ))}
        </SortableContext>
      </List>
    </DndContext>
  ) : (
    <>Not Found</>
  );
};

export default Playlist;
