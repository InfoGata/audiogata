import React, { Component } from "react";

interface IProps {
  backward: () => void;
  foward: () => void;
  togglePlay: () => void;
  isPlaying: boolean;
}

class Player extends Component<IProps, {}> {
  public render() {
    const playClass = this.props.isPlaying ? "fa fa-pause" : "fa fa-play";
    return (
      <div className="Player">
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
        <div className="player__foward">
          <button onClick={this.props.foward}>
            <i className="fa fa-forward" />
          </button>
        </div>
      </div>
    );
  }
}

export default Player;
