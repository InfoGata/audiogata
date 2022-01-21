import { Button, List } from "@mui/material";
import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { setSongs } from "../store/reducers/playlistReducer";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import PlaylistItem from "./PlaylistItem";

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

  const playPlaylist = () => {
    if (!playlist) {
      return;
    }

    const firstSong = playlist.songs[0];
    dispatch(setTrack(firstSong));
    dispatch(setTracks(playlist.songs));
  };

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

    if (playlist) {
      const tracks = Array.from(playlist.songs);
      const track = tracks.find((s) => s.id === draggableId);
      if (track) {
        tracks.splice(source.index, 1);
        tracks.splice(destination.index, 0, track);
        dispatch(setSongs(props.match.params.id, tracks));
      }
    }
  };
  return playlist ? (
    <>
      <div>{playlist.name}</div>
      <Button onClick={playPlaylist}>Play</Button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="playlist">
          {(provided) => (
            <>
              <List>
                {playlist.songs.map((song, index) => (
                  <PlaylistItem
                    key={song.id}
                    index={index}
                    song={song}
                    currentSong={currentSong}
                    playlist={playlist}
                  />
                ))}
              </List>
            </>
          )}
        </Droppable>
      </DragDropContext>
    </>
  ) : (
    <>Not Found</>
  );
};

export default Playlist;
