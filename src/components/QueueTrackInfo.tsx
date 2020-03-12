import React from "react";
import { RouteComponentProps } from "react-router";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import TrackInfo from "./TrackInfo";

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {}

const QueueTrackInfo: React.FC<IProps> = props => {
  const track = useSelector((state: AppState) =>
    state.song.songs.find(p => p.id === props.match.params.id),
  );
  return track ? <TrackInfo track={track} /> : <>Not Found</>;
};

export default QueueTrackInfo;