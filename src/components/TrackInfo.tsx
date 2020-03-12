import React from "react";
import { ISong } from "../models";

interface ITrackInfo {
  track: ISong;
}

const TrackInfo: React.FC<ITrackInfo> = props => {
  return <>
    {props.track.name}
  </>
};

export default TrackInfo;