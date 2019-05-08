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
    const playClass = this.props.isPlaying ? "fa fa-pause" : "fa fa-play";
    const shuffleClass = this.props.random
      ? "player__shuffle__active"
      : "player__shuffle";
    const repeatClass = this.props.repeat
      ? "player__repeat__active"
      : "player__repeat";
    return (
      <div className="player">
        <div className={shuffleClass}>
          <button onClick={this.props.toggleShuffle}>
            <i className="fa fa-random" />
          </button>
        </div>
        <div className={repeatClass}>
          <button onClick={this.props.toggleRepeat}>
            <i className="fa fa-repeat" />
          </button>
        </div>
        <div className="player__backward">
          <button onClick={this.props.backward}>
            <i className="fa fa-backward" />
          </button>
        </div>
        <div className="player__main">
          <button onClick={this.props.togglePlay}>
            <i className={playClass} />
          </button>
        </div>
        <div className="player__forward">
          <button onClick={this.props.foward}>
            <i className="fa fa-forward" />
          </button>
        </div>
      </div>
    );
  }
}

export default Player;
