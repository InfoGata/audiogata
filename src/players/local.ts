import { ISong } from "../models";
import { IFormatTrackApi } from "../services/apis/IFormatTrackApi";
import SoundCloud from "../services/apis/SoundCloud";
import Youtube from "../services/apis/Youtube";
import { IPlayerComponent } from "./IPlayerComponent";

class Local implements IPlayerComponent {
  private audio: HTMLAudioElement;
  public setTime?: (elapsed: number, total: number) => void;
  public onSongEnd?: () => void;
  constructor(
  ) {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => {
      if (this.setTime) {
        this.setTime(this.audio.currentTime, this.audio.duration);
      }
    };
    this.audio.onended = () =>{
      if (this.onSongEnd) {
        this.onSongEnd();
      }
    }
  }

  public init() {}

  public setVolume(volume: number) {
    this.audio.volume = volume;
  }

  public setPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }

  public pause() {
    if (this.audio.readyState === 4) {
      this.audio.pause();
    }
  }

  public resume() {
    if (this.audio.readyState === 4) {
      this.audio.play();
    }
  }

  public async play(song: ISong) {
    if (song.from) {
      const formatApi = this.getFormatTrackApiFromName(song.from);
      let source = song.source;

      if (formatApi) {
        source = await formatApi.getTrackUrl(song);
      }

      this.audio.src = source;
      this.audio.load();
      await this.audio.play();
    }
  }

  public seek(time: number) {
    this.audio.currentTime = time;
  }

  private getFormatTrackApiFromName(name: string): IFormatTrackApi | undefined {
    switch (name) {
      case "youtube":
        return Youtube;
      case "soundcloud":
        return SoundCloud;
    }
  }
}

export default new Local();
