import React, { Component } from "react";

interface IProps {
  onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: () => void;
  volume: number;
}

class Volume extends Component<IProps, {}> {
  public render() {
    const volumeIcon =
      this.props.volume === 0 ? "fa fa-volume-off" : "fa fa-volume-up";
    return (
      <div>
        <div>
          <i className={volumeIcon} onClick={this.props.onToggleMute} />
        </div>
        <input
          type="range"
          min="0.0"
          step="0.01"
          max="1.0"
          value={this.props.volume.toString()}
          onChange={this.props.onVolumeChange}
        />
      </div>
    );
  }
}

export default Volume;
