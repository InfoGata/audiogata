import { PlayCircle } from "@mui/icons-material";
import {
  Backdrop,
  Button,
  CircularProgress,
  IconButton,
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
import { Track, PageInfo } from "../types";
import { usePlugins } from "../PluginsContext";
import { useAppDispatch } from "../store/hooks";
import PlaylistItem from "./PlaylistItem";
import { setTracks } from "../store/reducers/trackReducer";

const PluginPlaylist: React.FC = () => {
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginid);
  const [playlistTracks, setPlaylistTracks] = React.useState<Track[]>([]);
  const [page, setPage] = React.useState<PageInfo>();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const theme = useTheme();
  const showTrackLength = useMediaQuery(theme.breakpoints.up("sm"));
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setBackdropOpen(true);
    const getPlaylistTracks = async () => {
      if (plugin && plugin.hasDefined.getPlaylistTracks()) {
        const t = await plugin.remote.getPlaylistTracks({
          playlist: {
            apiId: id,
            isUserPlaylist: true,
            tracks: [],
          },
        });
        setPlaylistTracks(t.items);
        setPage(t.pageInfo);
        setBackdropOpen(false);
      }
    };

    getPlaylistTracks();
  }, [plugin, id]);

  const onPlayClick = () => {
    const tracksWithIds = playlistTracks.map((t) => ({ ...t, id: t.apiId }));
    dispatch(setTracks(tracksWithIds));
  };

  const pageButtons = () => {
    if (!page) return;

    const hasPrev = page.offset !== 0;
    const nextOffset = page.offset + page.resultsPerPage;
    const hasNext = nextOffset < page.totalResults;

    const onPrev = async () => {
      if (!plugin) {
        return;
      }
      setBackdropOpen(true);
      const prevOffset = page.offset - page.resultsPerPage;
      const newPage: PageInfo = {
        offset: prevOffset,
        totalResults: page.totalResults,
        resultsPerPage: page.resultsPerPage,
        prevPage: page.prevPage,
      };
      const t = await plugin.remote.getPlaylistTracks({
        playlist: {
          apiId: id,
          isUserPlaylist: true,
          tracks: [],
        },
        page: newPage,
      });
      setPlaylistTracks(t.items);
      setPage(t.pageInfo);

      setBackdropOpen(false);
    };

    const onNext = async () => {
      if (!plugin) {
        return;
      }
      setBackdropOpen(true);
      const newPage: PageInfo = {
        offset: nextOffset,
        totalResults: page.totalResults,
        resultsPerPage: page.resultsPerPage,
        nextPage: page.nextPage,
      };

      const t = await plugin.remote.getPlaylistTracks({
        playlist: {
          apiId: id,
          isUserPlaylist: true,
          tracks: [],
        },
        page: newPage,
      });
      console.log(t.items);
      setPlaylistTracks(t.items);
      setPage(t.pageInfo);
      setBackdropOpen(false);
    };

    return (
      <>
        {hasPrev && <Button onClick={onPrev}>Prev</Button>}
        {hasNext && <Button onClick={onNext}>Next</Button>}
      </>
    );
  };

  return (
    <>
      <Backdrop open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <IconButton size="large" onClick={onPlayClick}>
        <PlayCircle color="success" sx={{ fontSize: 45 }} />
      </IconButton>
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
            {playlistTracks.map((track, index) => (
              <TableRow hover={true} key={index}>
                <PlaylistItem track={track} showTrackLength={showTrackLength} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {page && pageButtons()}
    </>
  );
};

export default PluginPlaylist;
