import VolumeOff from "@material-ui/icons/VolumeOff";
import VolumeUp from "@material-ui/icons/VolumeUp";
import Slider from "@material-ui/lab/Slider";
import React from "react";

interface IProps {
  onVolumeChange: (event: React.ChangeEvent<{}>, volume: number) => void;
  onToggleMute: () => void;
  volume: number;
  muted: boolean;
}

const Volume = (props: IProps) => {
  const volumeIcon =
    props.volume === 0 || props.muted ? <VolumeOff /> : <VolumeUp />;
  return (
    <div>
      <button onClick={props.onToggleMute}>{volumeIcon}</button>
      <div>
        <Slider
          min={0}
          max={1}
          value={props.volume}
          onChange={props.onVolumeChange}
        />
      </div>
    </div>
  );
};

export default Volume;
