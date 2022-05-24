import {
  Backdrop,
  IconButton,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import PlaylistItem from "./PlaylistItem";
import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { db } from "../database";
import Sortable from "./Sortable";
import { IPlaylist, ISong } from "../types";
import SortableRow from "./SortableRow";
import { useAppDispatch } from "../store/hooks";
import { setPlaylistTracks } from "../store/reducers/playlistReducer";
import { PlayCircle } from "@mui/icons-material";

const Playlist: React.FC = () => {
  const { id } = useParams<"id">();
  const dispatch = useAppDispatch();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [playlist, setPlaylist] = React.useState<IPlaylist | undefined>();
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const getPlaylist = async () => {
      if (id) {
        setPlaylist(await db.playlists.get(id));
        setLoaded(true);
      }
    };
    getPlaylist();
  }, [id]);
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
        dispatch(setPlaylistTracks(playlist, newList));
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

  return (
    <>
      <Backdrop open={!loaded}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {playlist ? (
        <>
          <div>{playlist.name}</div>
          <IconButton size="large" onClick={playPlaylist}>
            <PlayCircle color="success" sx={{ fontSize: 45 }} />
          </IconButton>
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
                      />
                    ) : null}
                  </DragOverlay>
                </TableBody>
              </Table>
            </TableContainer>
          </Sortable>
        </>
      ) : (
        <>{loaded && <Typography>Not Found</Typography>}</>
      )}
    </>
  );
};

export default Playlist;
