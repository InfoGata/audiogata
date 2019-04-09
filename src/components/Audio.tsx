import React, { Component } from "react";

interface IProps {
  onSongEnd: () => void;
  setTime: (elapsed: number, duration: number) => void;
  onReady: () => void;
}

class AudioComponent extends Component<IProps, {}> {
  private audioRef = React.createRef<HTMLAudioElement>();
  public render() {
    return (
      <div>
        <audio
          ref={this.audioRef}
          onEnded={this.props.onSongEnd}
          onTimeUpdate={this.onTimeUpdate}
        />
      </div>
    );
  }

  public setVolume(volume: number) {
    if (this.audioRef.current) {
      this.audioRef.current.volume = volume;
    }
  }

  public pause() {
    if (this.audioRef.current) {
      this.audioRef.current.pause();
    }
  }

  public resume() {
    if (this.audioRef.current) {
      this.audioRef.current.play();
    }
  }

  public play(src: string) {
    if (this.audioRef.current) {
      this.audioRef.current.src = src;
      this.audioRef.current.load();
      this.audioRef.current.play();
    }
  }

  public seek(time: number) {
    if (this.audioRef.current) {
      this.audioRef.current.currentTime = time;
    }
  }

  private onTimeUpdate = () => {
    if (this.audioRef.current) {
      this.props.setTime(
        this.audioRef.current.currentTime,
        this.audioRef.current.duration,
      );
    }
  };
}

export default AudioComponent;
