import React from "react";
import { useParams } from "react-router";
import { useAppSelector } from "../store/hooks";
import TrackInfo from "./TrackInfo";

const QueueTrackInfo: React.FC = () => {
  const { id } = useParams<"id">();
  const track = useAppSelector((state) =>
    state.track.tracks.find((p) => p.id === id)
  );
  return track ? <TrackInfo track={track} /> : <>Not Found</>;
};

export default QueueTrackInfo;
