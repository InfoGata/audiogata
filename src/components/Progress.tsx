import { createStyles, WithStyles, withStyles } from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
import React, { Component } from "react";

const styles = createStyles({
  container: {
    width: 500,
  },
});

interface IProps extends WithStyles<typeof styles> {
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
          {this.formatSeconds(elapsed)} / {this.formatSeconds(this.props.total)}
        </span>
        <div className={this.props.classes.container}>
          <Slider
            min={0}
            max={this.props.total}
            value={elapsed}
            onChange={this.onChange}
            onDragStart={this.onMouseDown}
            onDragEnd={this.onMouseUp}
          />
        </div>
      </div>
    );
  }

  private onChange = (e: React.ChangeEvent<{}>, value: number) => {
    if (this.state.isDragging) {
      this.setState({
        newElapsed: value,
      });
    } else {
      this.props.onSeek(value);
    }
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

export default withStyles(styles)(Progress);
