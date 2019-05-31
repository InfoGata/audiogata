import axios from "axios";
import React from "react";
import { AuthService } from "../services/data/auth.service";
import { ISong } from "../services/data/database";
import { IPlayerComponent } from "./IPlayerComponent";

interface ISpotifyState {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  internalTime: number;
  totalTime: number;
  player: any;
}

interface IProps {
  onSongEnd: () => void;
  setTime: (elapsed: number, total: number) => void;
}

interface IRefreshTokenResponse {
  access_token: string;
}

class SpotifyComponent extends React.Component<IProps, ISpotifyState>
  implements IPlayerComponent {
  private readonly apiUrl = "https://api.spotify.com/v1";
  private readonly serverUrl = "http://localhost:8888";
  private readonly name = "spotify";
  private readonly authService = new AuthService();
  private interval: NodeJS.Timeout | undefined;
  constructor(props: any) {
    super(props);
    this.state = {
      accessToken: "",
      deviceId: "",
      internalTime: 0,
      player: null,
      refreshToken: "",
      totalTime: 0,
    };
  }

  public async componentDidMount() {
    const query = new URLSearchParams(window.location.search);
    if (query.has("access_token") && query.has("refresh_token")) {
      const accessToken = query.get("access_token") || "";
      const refreshToken = query.get("refresh_token") || "";
      this.authService.addAuth({
        accessToken,
        name: "spotify",
        refreshToken,
      });
      this.setState({
        accessToken,
        refreshToken,
      });
    } else {
      const auth = await this.authService.getAuthByName("spotify");
      if (auth) {
        this.setState({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        });
      }
    }
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      if (this.state.accessToken.length > 0) {
        const player = new (window as any).Spotify.Player({
          getOAuthToken: async (cb: (arg0: string) => void) => {
            const accessToken = await this.refreshLogin();
            cb(accessToken);
          },
          name: "Web Playback SDK Quick Start Player",
        });
        // Error handling
        player.addListener(
          "initialization_error",
          ({ message }: { message: any }) => {
            console.error(message);
          },
        );
        player.addListener(
          "authentication_error",
          ({ message }: { message: any }) => {
            console.error(message);
          },
        );
        player.addListener("account_error", ({ message }: { message: any }) => {
          console.error(message);
        });
        player.addListener(
          "playback_error",
          ({ message }: { message: any }) => {
            console.error(message);
          },
        );
        // Playback status updates
        player.addListener("player_state_changed", (state: any) => {
          console.log(state);
          this.props.setTime(state.position / 1000, state.duration / 1000);
          this.setState({
            internalTime: state.position,
            totalTime: state.duration,
          });
          // Attempt to detect if the song has ended
          if (
            state.paused &&
            state.position === 0 &&
            state.restrictions.disallow_resuming_reasons &&
            state.restrictions.disallow_resuming_reasons[0] === "not_paused"
          ) {
            if (this.interval) {
              clearInterval(this.interval);
            }
            this.props.onSongEnd();
          }
        });
        // Ready
        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          console.log("Ready with Device ID", device_id);
          this.setState({
            deviceId: device_id,
          });
        });
        // Not Ready
        player.addListener(
          "not_ready",
          ({ device_id }: { device_id: string }) => {
            console.log("Device ID has gone offline", device_id);
          },
        );
        // Connect to the player!
        player.connect();
        this.setState({
          player,
        });
      }
    };
  }

  public async play(song: ISong) {
    if (!this.state.deviceId) {
      return;
    }
    const url = `${this.apiUrl}/me/player/play?device_id=${
      this.state.deviceId
    }`;

    const trackId = song.apiId || "";
    await axios.put(
      url,
      {
        uris: [trackId],
      },
      {
        headers: {
          Authorization: `Bearer ${this.state.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    this.interval = setInterval(this.updateTime, 1000);
  }

  public pause() {
    this.state.player.pause();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public resume() {
    this.state.player.resume();
    this.interval = setInterval(this.updateTime, 1000);
  }

  public seek(timeInSeconds: number) {
    this.state.player.seek(timeInSeconds * 1000);
  }

  public setVolume(volume: number) {
    this.state.player.setVolume(volume);
  }

  public render() {
    return null;
  }

  private updateTime = () => {
    const newTime = this.state.internalTime + 1000;
    this.setState({
      internalTime: newTime,
    });
    this.props.setTime(newTime / 1000, this.state.totalTime / 1000);
  };

  private async refreshLogin() {
    if (this.state.refreshToken.length > 0) {
      const refreshUrl = `${this.serverUrl}/refresh_token?refresh_token=${
        this.state.refreshToken
      }`;
      const response = await axios.get<IRefreshTokenResponse>(refreshUrl);
      const accessToken = response.data.access_token;
      this.setState({
        accessToken,
      });
      const refreshToken = this.state.refreshToken;
      await this.authService.addAuth({
        accessToken,
        name: "spotify",
        refreshToken,
      });
      return accessToken;
    }
    return "";
  }
}

export default SpotifyComponent;
