import { PlayTrackRequest } from "./plugintypes";
import { PlayerComponent } from "./types";
import Hls from "hls.js";
export const HLS_EXTENSIONS = /\.(m3u8)($|\?)/i;

let hls: Hls | undefined;
class LocalPlayer implements PlayerComponent {
  public name = "local";
  private audio: HTMLAudioElement;
  public setTime?: (elapsed: number) => void;
  public onTrackEnd?: () => void;
  constructor() {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => {
      if (this.setTime) {
        this.setTime(this.audio.currentTime);
      }
    };
    this.audio.onended = () => {
      if (this.onTrackEnd) {
        this.onTrackEnd();
      }
    };
  }

  public async onSetVolume(volume: number) {
    this.audio.volume = volume;
  }

  public async onSetPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }

  public async onPause() {
    if (this.audio.readyState >= 3) {
      this.audio.pause();
    }
  }

  public async onResume() {
    if (this.audio.readyState >= 3) {
      this.audio.play();
    }
  }

  public async onPlay(request: PlayTrackRequest) {
    if (request.source) {
      if (HLS_EXTENSIONS.test(request.source) && Hls.isSupported()) {
        if (hls) {
          hls.destroy();
        }
        const newHls = new Hls();
        newHls.attachMedia(this.audio);
        newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
          if (request.source) {
            newHls.loadSource(request.source);
          }
          newHls.on(Hls.Events.MANIFEST_LOADED, () => {
            this.audio.play();
          });
        });
        hls = newHls;
      } else {
        this.audio.src = request.source;
        this.audio.load();
        await this.audio.play();
      }
    }
  }

  public async onSeek(time: number) {
    this.audio.currentTime = time;
  }
}

export const localPlayer = new LocalPlayer();
