import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { db } from "../database";
import { Track } from "../plugintypes";
import TrackInfo from "./TrackInfo";

const PlaylistTrackInfo: React.FC = () => {
  const { id } = useParams<"id">();
  const { playlistid } = useParams<"playlistid">();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [track, setTrack] = React.useState<Track>();
  React.useEffect(() => {
    const getTrack = async () => {
      setBackdropOpen(true);
      if (playlistid) {
        const playlist = await db.playlists.get(playlistid);
        const track = playlist?.tracks.find((t) => t.id === id);
        setTrack(track);
      }
      setBackdropOpen(false);
    };

    getTrack();
  }, [id, playlistid]);
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
