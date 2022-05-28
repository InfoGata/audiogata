import { PlayCircle } from "@mui/icons-material";
import {
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
import { ISong } from "../types";
import { usePlugins } from "../PluginsContext";
import { useAppDispatch } from "../store/hooks";
import PlaylistItem from "./PlaylistItem";
import { setTracks } from "../store/reducers/songReducer";

const PluginPlaylist: React.FC = () => {
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginid);
  const [playlistTracks, setPlaylistTracks] = React.useState<ISong[]>([]);
  const theme = useTheme();
  const showTrackLength = useMediaQuery(theme.breakpoints.up("sm"));
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const getPlaylistTracks = async () => {
      if (plugin && plugin.hasDefined.getPlaylistTracks()) {
        const t = await plugin.remote.getPlaylistTracks({
          playlist: {
            apiId: id,
            isUserPlaylist: true,
            songs: [],
          },
        });
        setPlaylistTracks(t.items);
      }
    };

    getPlaylistTracks();
  }, [plugin, id]);

  const onPlayClick = () => {
    const tracksWithIds = playlistTracks.map((t) => ({ ...t, id: t.apiId }));
    dispatch(setTracks(tracksWithIds));
  };

  return (
    <>
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
                <PlaylistItem song={track} showTrackLength={showTrackLength} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default PluginPlaylist;
