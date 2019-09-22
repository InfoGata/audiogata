import { ISong } from "../services/data/database";
import { IPlayerComponent } from "./IPlayerComponent";

declare var Napster: any;

class NapsterPlayer implements IPlayerComponent {
  private readonly apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  private readonly setTime: (elapsed: number, total: number) => void;
  private readonly onSongEnd: () => void;

  constructor(
    setTime: (elapsed: number, total: number) => void,
    onSongEnd: () => void
  ) {
    this.setTime = setTime;
    this.onSongEnd = onSongEnd;
    this.init();
  }

  public init() {
    Napster.init({
      consumerKey: this.apiKey,
      isHTML5Compatible: true,
    });
    Napster.player.on("ready", () => {
      const query = new URLSearchParams(window.location.search);
      // if (query.has("accessToken") && query.has("refreshToken")) {
      //   const accessToken = query.get("accessToken") || "";
      //   const refreshToken = query.get("refreshToken") || "";
      //   this.authService.addAuth({
      //     accessToken,
      //     name: "napster",
      //     refreshToken,
      //   });
      //   Napster.member.set({
      //     accessToken,
      //     refreshToken,
      //   });
      // } else {
      //   this.authService.getAuthByName("napster").then(auth => {
      //     if (auth) {
      //       Napster.member.set({
      //         accessToken: auth.accessToken,
      //         refreshToken: auth.refreshToken,
      //       });
      //     }
      //   });
      // }
      Napster.player.on("playevent", (e: any) => {
        if (e.data.code === "PlayComplete") {
          this.onSongEnd();
        }
      });
      Napster.player.on("playtimer", (e: any) => {
        const current = e.data.currentTime;
        const duration = e.data.totalTime;
        this.setTime(current, duration);
      });
    });
  }

  public async play(song: ISong) {
    const id = song.apiId || "";
    Napster.player.play(id);
  }

  public pause() {
    Napster.player.pause();
  }

  public resume() {
    Napster.player.resume();
  }

  public seek(time: number) {
    Napster.player.seek(time);
  }

  public setVolume(volume: number) {
    Napster.player.setVolume(volume);
  }
}

export default NapsterPlayer;