import React, { Component } from "react";
import { AuthService } from "../services/data/auth.service";
import { ISong } from "../services/data/database";
import { IPlayerComponent } from "./IPlayerComponent";
declare var Napster: any;

interface IProps {
  setTime: (elapsed: number, total: number) => void;
  onSongEnd: () => void;
  onReady: (name: string) => void;
}
class NapsterComponent extends Component<IProps, {}>
  implements IPlayerComponent {
  private readonly authService = new AuthService();
  private readonly apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  private readonly name = "napster";

  public async componentDidMount() {
    Napster.init({
      consumerKey: this.apiKey,
      isHTML5Compatible: true,
    });
    Napster.player.on("ready", () => {
      const query = new URLSearchParams(window.location.search);
      if (query.has("accessToken") && query.has("refreshToken")) {
        const accessToken = query.get("accessToken") || "";
        const refreshToken = query.get("refreshToken") || "";
        this.authService.addAuth({
          accessToken,
          name: "napster",
          refreshToken,
        });
        Napster.member.set({
          accessToken,
          refreshToken,
        });
      } else {
        this.authService.getAuthByName("napster").then(auth => {
          if (auth) {
            Napster.member.set({
              accessToken: auth.accessToken,
              refreshToken: auth.refreshToken,
            });
            this.props.onReady(this.name);
          }
        });
      }
      Napster.player.on("playevent", (e: any) => {
        if (e.data.code === "PlayComplete") {
          this.props.onSongEnd();
        }
      });
      Napster.player.on("playtimer", (e: any) => {
        const current = e.data.currentTime;
        const duration = e.data.totalTime;
        this.props.setTime(current, duration);
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

  public render() {
    return null;
  }
}

export default NapsterComponent;
