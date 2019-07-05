import { IFormatTrackApi } from "../services/apis/IFormatTrackApi";
import SoundCloud from "../services/apis/SoundCloud";
import Youtube from "../services/apis/Youtube";
import { ISong } from "../services/data/database";
import { IPlayerComponent } from "./IPlayerComponent";

class Local implements IPlayerComponent {
  private audio: HTMLAudioElement;
  constructor(
    setTime: (currentTime: number, duration: number) => void,
    onSongEnd: () => void) {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => {
      setTime(this.audio.currentTime, this.audio.duration);
    };
    this.audio.onended = onSongEnd;
  }

  public setVolume(volume: number) {
    this.audio.volume = volume;
  }

  public pause() {
    this.audio.pause();
  }

  public resume() {
    this.audio.play();
  }

  public async play(song: ISong) {
    if (song.from) {
      const formatApi = this.getFormatTrackApiFromName(song.from);
      let source = song.source;

      if (song.useBlob) {
        source = URL.createObjectURL(song.source);
      } else if (formatApi) {
        source = await formatApi.getTrackUrl(song);
      }

      this.audio.src = source;
      this.audio.load();
      this.audio.play();
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

export default Local;