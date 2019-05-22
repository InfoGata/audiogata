import VolumeOff from "@material-ui/icons/VolumeOff";
import VolumeUp from "@material-ui/icons/VolumeUp";
import Slider from "@material-ui/lab/Slider";
import React, { PureComponent } from "react";

interface IProps {
  onVolumeChange: (event: React.ChangeEvent<{}>, volume: number) => void;
  onToggleMute: () => void;
  volume: number;
  muted: boolean;
}

class Volume extends PureComponent<IProps, {}> {
  public render() {
    const volumeIcon =
      this.props.volume === 0 || this.props.muted ? (
        <VolumeOff />
      ) : (
        <VolumeUp />
      );
    return (
      <div>
        <button onClick={this.props.onToggleMute}>{volumeIcon}</button>
        <div>
          <Slider
            min={0}
            max={1}
            value={this.props.volume}
            onChange={this.props.onVolumeChange}
          />
        </div>
      </div>
    );
  }
}

export default Volume;
