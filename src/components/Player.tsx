import Pause from "@material-ui/icons/Pause";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Repeat from "@material-ui/icons/Repeat";
import Shuffle from "@material-ui/icons/Shuffle";
import SkipNext from "@material-ui/icons/SkipNext";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import React, { Component } from "react";

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

class Player extends Component<IProps, {}> {
  public render() {
    const playIcon = this.props.isPlaying ? <Pause /> : <PlayArrow />;
    const shuffleColor = this.props.random ? "primary" : "inherit";
    const repeatColor = this.props.repeat ? "primary" : "inherit";
    return (
      <div>
        <button onClick={this.props.toggleShuffle}>
          <Shuffle color={shuffleColor} />
        </button>
        <button onClick={this.props.toggleRepeat}>
          <Repeat color={repeatColor} />
        </button>
        <button onClick={this.props.backward}>
          <SkipPrevious />
        </button>
        <button onClick={this.props.togglePlay}>{playIcon}</button>
        <button onClick={this.props.foward}>
          <SkipNext />
        </button>
      </div>
    );
  }
}

export default Player;
