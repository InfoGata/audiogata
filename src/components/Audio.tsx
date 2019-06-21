import React, { Component } from "react";
import { IFormatTrackApi } from "../services/apis/IFormatTrackApi";
import SoundCloud from "../services/apis/SoundCloud";
import Youtube from "../services/apis/Youtube";
import { ISong } from "../services/data/database";
import { IPlayerComponent } from "./IPlayerComponent";

interface IProps {
  onSongEnd: () => void;
  setTime: (elapsed: number, duration: number) => void;
}

class AudioComponent extends Component<IProps, {}> implements IPlayerComponent {
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

  public async play(song: ISong) {
    if (this.audioRef.current && song.from) {
      const formatApi = this.getFormatTrackApiFromName(song.from);
      let source = song.source;

      if (song.useBlob) {
        source = URL.createObjectURL(song.source);
      } else if (formatApi) {
        source = await formatApi.getTrackUrl(song);
      }

      this.audioRef.current.src = source;
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

  private getFormatTrackApiFromName(name: string): IFormatTrackApi | undefined {
    switch (name) {
      case "youtube":
        return Youtube;
      case "soundcloud":
        return SoundCloud;
    }
  }
}

export default AudioComponent;
