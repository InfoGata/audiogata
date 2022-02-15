import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import PlaylistItem from "./PlaylistItem";
import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { setSongs } from "../store/reducers/playlistReducer";
import Sortable from "./Sortable";
import { ISong } from "../models";
import SortableRow from "./SortableRow";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const Playlist: React.FC = () => {
  const { id } = useParams<"id">();
  const dispatch = useAppDispatch();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const playlist = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === id)
  );
  const theme = useTheme();
  const showTrackLength = useMediaQuery(theme.breakpoints.up("sm"));
  const dragDisabled = false;

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

  const playSong = (song: ISong) => {
    dispatch(setTrack(song));
    dispatch(setTracks(playlist?.songs || []));
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
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Title</TableCell>
                {showTrackLength && <TableCell>Track Length</TableCell>}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playlist.songs.map((s) => (
                <SortableRow
                  id={s.id || ""}
                  key={s.id}
                  onClick={() => playSong(s)}
                  disabled={dragDisabled}
                >
                  <PlaylistItem
                    showTrackLength={showTrackLength}
                    key={s.id}
                    song={s}
                    playlist={playlist}
                  />
                </SortableRow>
              ))}
              <DragOverlay wrapperElement="tr">
                {activeId ? (
                  <PlaylistItem
                    showTrackLength={showTrackLength}
                    key={activeId}
                    song={
                      playlist.songs.find((s) => s.id === activeId) ||
                      ({} as ISong)
                    }
                    playlist={playlist}
                  />
                ) : null}
              </DragOverlay>
            </TableBody>
          </Table>
        </TableContainer>
      </Sortable>
    </>
  ) : (
    <>Not Found</>
  );
};

export default Playlist;
