import { Button, List } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import PlaylistItem from "./PlaylistItem";
import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { setSongs } from "../store/reducers/playlistReducer";
import Sortable from "./Sortable";
import { ISong } from "../models";

const Playlist: React.FC = () => {
  const { id } = useParams<"id">();
  const dispatch = useDispatch<AppDispatch>();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const playlist = useSelector((state: AppState) =>
    state.playlist.playlists.find((p) => p.id === id)
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
      if (id) {
        dispatch(setSongs(id, newList));
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  return playlist ? (
    <>
      <div>{playlist.name}</div>
      <Button onClick={playPlaylist}>Play</Button>
      <Sortable
        ids={playlist.songs.map((s) => s.id || "")}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <List component="div">
          {playlist.songs.map((s) => (
            <PlaylistItem key={s.id} song={s} playlist={playlist} />
          ))}
          <DragOverlay>
            {activeId ? (
              <PlaylistItem
                key={activeId}
                song={
                  playlist.songs.find((s) => s.id === activeId) || ({} as ISong)
                }
                playlist={playlist}
              />
            ) : null}
          </DragOverlay>
        </List>
      </Sortable>
    </>
  ) : (
    <>Not Found</>
  );
};

export default Playlist;
