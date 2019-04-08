import axios from "axios";
import React, { Component } from "react";
import { AuthService } from "../services/data/auth.service";

interface ISpotifyState {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  player: any;
}

interface IProps {
  onSongEnd: () => void;
  setTime: (elapsed: number, total: number) => void;
}

declare var Spotify: any;
class SpotifyComponent extends Component<IProps, ISpotifyState> {
  private readonly apiUrl = "https://api.spotify.com/v1";
  private readonly serverUrl = "http://localhost:8888";
  private readonly authService = new AuthService();
  constructor(props: any) {
    super(props);
    this.state = {
      accessToken: "",
      deviceId: "",
      player: null,
      refreshToken: "",
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
        const player = new Spotify.Player({
          getOAuthToken: (cb: (arg0: string) => void) => {
            cb(this.state.accessToken);
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
          // Attempt to detect if the song has ended
          if (
            state.paused &&
            state.position === 0 &&
            state.restrictions.disallow_resuming_reasons &&
            state.restrictions.disallow_resuming_reasons[0] === "not_paused"
          ) {
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

  public async play(trackId: string) {
    if (!this.state.deviceId) {
      return;
    }
    const url = `${this.apiUrl}/me/player/play?device_id=${
      this.state.deviceId
    }`;
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
  }

  public pause() {
    this.state.player.pause();
  }

  public resume() {
    this.state.player.resume();
  }

  public seek(timeInSeconds: number) {
    this.state.player.seek(timeInSeconds * 1000);
  }

  public setVolume(volume: number) {
    this.state.player.setVolume(volume);
  }

  public render() {
    return (
      <div>
        <a href="#" onClick={this.onLoginClick}>
          Login to Spotify
        </a>
      </div>
    );
  }

  private onLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const loginUrl = `${this.serverUrl}/login`;
    window.location.href = `${loginUrl}`;
  };
}

export default SpotifyComponent;
