import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { db } from "../database";
import { Track } from "../plugintypes";
import TrackInfo from "./TrackInfo";

const PlaylistTrackInfo: React.FC = () => {
  const { trackId } = useParams<"trackId">();
  const { playlistId } = useParams<"playlistId">();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [track, setTrack] = React.useState<Track>();

  React.useEffect(() => {
    const getTrack = async () => {
      setBackdropOpen(true);
      if (playlistId) {
        const playlist = await db.playlists.get(playlistId);
        const track = playlist?.tracks.find((t) => t.id === trackId);
        setTrack(track);
      }
      setBackdropOpen(false);
    };

    getTrack();
  }, [trackId, playlistId]);

  return (
    <>
      <Backdrop open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {track ? <TrackInfo track={track} /> : <>Not Found</>}
    </>
  );
};

export default PlaylistTrackInfo;
