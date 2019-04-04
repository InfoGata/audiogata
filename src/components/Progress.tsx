import React, { Component } from "react";

interface IProps {
  elapsed: number;
  total: number;
  onSeek: (newTime: number) => void;
}

interface IState {
  isDragging: boolean;
  newElapsed: number;
}

class Progress extends Component<IProps, IState> {
  constructor(props: Readonly<IProps>) {
    super(props);

    this.state = {
      isDragging: false,
      newElapsed: 0,
    };
  }

  public render() {
    const elapsed = this.state.isDragging
      ? this.state.newElapsed
      : this.props.elapsed;

    return (
      <div className="progress">
        <span className="player__time-elapsed">
          {this.formatSeconds(elapsed)}
        </span>
        <input
          type="range"
          min="0"
          max={this.props.total}
          value={elapsed}
          onChange={this.onChange}
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onTouchEnd={this.onMouseUp}
        />
        <span className="player__time-total">
          {this.formatSeconds(this.props.total)}
        </span>
      </div>
    );
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      newElapsed: parseFloat(e.currentTarget.value),
    });
  };

  private onMouseDown = () => {
    this.setState({
      isDragging: true,
      newElapsed: this.props.elapsed,
    });
  };

  private onMouseUp = () => {
    this.props.onSeek(this.state.newElapsed);
    this.setState({
      isDragging: false,
    });
  };

  private formatSeconds(seconds: number) {
    // hours
    seconds = seconds % 3600;

    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    seconds = Math.round(seconds);
    // Return as string
    return (
      (minutes < 10 ? "0" : "") +
      minutes +
      ":" +
      (seconds < 10 ? "0" : "") +
      seconds
    );
  }
}

export default Progress;
