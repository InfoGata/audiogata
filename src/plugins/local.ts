import { ISong } from "../models";
import { IPlayerComponent } from "./IPlayerComponent";

class Local implements IPlayerComponent {
  public name = "local";
  private audio: HTMLAudioElement;
  public setTime?: (elapsed: number, total: number) => void;
  public onSongEnd?: () => void;
  constructor() {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => {
      if (this.setTime) {
        this.setTime(this.audio.currentTime, this.audio.duration);
      }
    };
    this.audio.onended = () => {
      if (this.onSongEnd) {
        this.onSongEnd();
      }
    };
  }

  public async setVolume(volume: number) {
    this.audio.volume = volume;
  }

  public async setPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }

  public async pause() {
    if (this.audio.readyState >= 3) {
      this.audio.pause();
    }
  }

  public async resume() {
    if (this.audio.readyState >= 3) {
      this.audio.play();
    }
  }

  public async play(song: ISong) {
    this.audio.src = song.source;
    this.audio.load();
    await this.audio.play();
  }

  public async seek(time: number) {
    this.audio.currentTime = time;
  }
}

export default new Local();
