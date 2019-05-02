import React, { Component } from "react";

interface IProps {
  backward: () => void;
  foward: () => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  isPlaying: boolean;
  random: boolean;
}

class Player extends Component<IProps, {}> {
  public render() {
    const playClass = this.props.isPlaying ? "fa fa-pause" : "fa fa-play";
    const shuffleClass = this.props.random
      ? "player__shuffle__active"
      : "player__shuffle";
    return (
      <div className="player">
        <div className={shuffleClass}>
          <button onClick={this.props.toggleShuffle}>
            <i className="fa fa-random" />
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
