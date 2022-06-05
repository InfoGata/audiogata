import { PlayerComponent, Track } from "./types";

class LocalPlayer implements PlayerComponent {
  public name = "local";
  private audio: HTMLAudioElement;
  public setTime?: (elapsed: number, total: number) => void;
  public onTrackEnd?: () => void;
  constructor() {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => {
      if (this.setTime) {
        this.setTime(this.audio.currentTime, this.audio.duration);
      }
    };
    this.audio.onended = () => {
      if (this.onTrackEnd) {
        this.onTrackEnd();
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

  public async play(track: Track) {
    if (track.source) {
      this.audio.src = track.source;
    }
    this.audio.load();
    await this.audio.play();
  }

  public async seek(time: number) {
    this.audio.currentTime = time;
  }
}

export default new LocalPlayer();
