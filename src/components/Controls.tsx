import Pause from "@material-ui/icons/Pause";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Repeat from "@material-ui/icons/Repeat";
import Shuffle from "@material-ui/icons/Shuffle";
import SkipNext from "@material-ui/icons/SkipNext";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import React from "react";

interface IProps {
  backward: () => void;
  foward: () => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  isPlaying: boolean;
  random: boolean;
  repeat: boolean;
}

const Controls: React.FC<IProps> = props => {
  const playIcon = props.isPlaying ? <Pause /> : <PlayArrow />;
  const shuffleColor = props.random ? "primary" : "inherit";
  const repeatColor = props.repeat ? "primary" : "inherit";
  return (
    <div>
      <button onClick={props.toggleShuffle}>
        <Shuffle color={shuffleColor} />
      </button>
      <button onClick={props.toggleRepeat}>
        <Repeat color={repeatColor} />
      </button>
      <button onClick={props.backward}>
        <SkipPrevious />
      </button>
      <button onClick={props.togglePlay}>{playIcon}</button>
      <button onClick={props.foward}>
        <SkipNext />
      </button>
    </div>
  );
};

export default Controls;
