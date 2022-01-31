import React from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import TrackInfo from "./TrackInfo";

interface IParams {
  id: string;
}

const QueueTrackInfo: React.FC = () => {
  const { id } = useParams<IParams>();
  const track = useSelector((state: AppState) =>
    state.song.songs.find((p) => p.id === id)
  );
  return track ? <TrackInfo track={track} /> : <>Not Found</>;
};

export default QueueTrackInfo;
