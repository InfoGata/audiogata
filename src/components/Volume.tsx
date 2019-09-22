import { Slider } from "@material-ui/core";
import VolumeOff from "@material-ui/icons/VolumeOff";
import VolumeUp from "@material-ui/icons/VolumeUp";
import React from "react";

interface IProps {
  onVolumeChange: (
    event: React.ChangeEvent<{}>,
    volume: number | number[],
  ) => void;
  onToggleMute: () => void;
  volume: number;
  muted: boolean;
}

const Volume: React.FC<IProps> = props => {
  const volumeIcon =
    props.volume === 0 || props.muted ? <VolumeOff /> : <VolumeUp />;
  return (
    <div>
      <button onClick={props.onToggleMute}>{volumeIcon}</button>
      <div>
        <Slider
          min={0}
          max={100}
          value={props.volume * 100}
          onChange={props.onVolumeChange}
        />
      </div>
    </div>
  );
};

export default Volume;
