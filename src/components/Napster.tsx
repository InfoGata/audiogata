import React, { Component } from "react";
import { AuthService } from "../services/data/auth.service";
declare var Napster: any;

interface IProps {
  setTime: (elapsed: number, total: number) => void;
  onSongEnd: () => void;
  onReady: () => void;
}
class NapsterComponent extends Component<IProps, {}> {
  private readonly authService = new AuthService();
  private readonly apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  private readonly napsterApi = "https://api.napster.com";
  private readonly serverUrl = "http://localhost:2000";
  private readonly oauthUrl = `${this.napsterApi}/oauth/authorize?client_id=${
    this.apiKey
  }&response_type=code`;

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
            this.props.onReady();
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

  public play(id: string) {
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
    return (
      <div>
        <a href="#" onClick={this.onLoginClick}>
          Login to Napster
        </a>
      </div>
    );
  }

  private onLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const redirectUrl = `${this.serverUrl}/authorize`;
    window.location.href = `${this.oauthUrl}&redirect_uri=${redirectUrl}`;
  };
}

export default NapsterComponent;
