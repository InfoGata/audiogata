import axios from "axios";
import { ISong } from "../models";
import { IPlayerComponent } from "./IPlayerComponent";

interface IRefreshTokenResponse {
  access_token: string;
}

class SpotifyPlayer implements IPlayerComponent {
  private readonly apiUrl = "https://api.spotify.com/v1";
  private readonly serverUrl = "http://localhost:8888";
  private readonly setTime: (elapsed: number, total: number) => void;
  private readonly onSongEnd: () => void;
  private deviceId: string;
  private accessToken: string;
  private refreshToken: string;
  private internalTime: number;
  private totalTime: number;
  private player: any;
  private interval: NodeJS.Timeout | undefined;
  constructor(
    setTime: (elapsed: number, total: number) => void,
    onSongEnd: () => void) {

    this.setTime = setTime
    this.onSongEnd = onSongEnd;
    this.deviceId = "";
    this.accessToken = "";
    this.refreshToken = ""
    this.internalTime = 0;
    this.totalTime = 0;
    this.init();
  }

  public init() {
    const query = new URLSearchParams(window.location.search);
    // if (query.has("access_token") && query.has("refresh_token")) {
    //   const accessToken = query.get("access_token") || "";
    //   const refreshToken = query.get("refresh_token") || "";
    //   this.authService.addAuth({
    //     accessToken,
    //     name: "spotify",
    //     refreshToken,
    //   });
    //   this.accessToken = accessToken;
    //   this.refreshToken = refreshToken;
    // } else {
    //   this.authService.getAuthByName("spotify").then(auth => {
    //     if (auth) {
    //       this.accessToken = auth.accessToken;
    //       this.refreshToken = auth.refreshToken;
    //     }
    //   });
    // }
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      if (this.accessToken.length > 0) {
        const player = new (window as any).Spotify.Player({
          getOAuthToken: async (cb: (arg0: string) => void) => {
            cb(this.accessToken);
          },
          name: "Web Playback SDK Quick Start Player",
        });
        // Error handling
        player.addListener(
          "initialization_error",
          ({ message }: { message: any }) => {
            // tslint:disable-next-line: no-console
            console.error(message);
          },
        );
        player.addListener(
          "authentication_error",
          ({ message }: { message: any }) => {
            // tslint:disable-next-line: no-console
            console.error(message);
          },
        );
        player.addListener("account_error", ({ message }: { message: any }) => {
          // tslint:disable-next-line: no-console
          console.error(message);
        });
        player.addListener(
          "playback_error",
          ({ message }: { message: any }) => {
            // tslint:disable-next-line: no-console
            console.error(message);
          },
        );
        // Playback status updates
        player.addListener("player_state_changed", (state: any) => {
          // tslint:disable-next-line: no-console
          console.log(state);
          this.setTime(state.position / 1000, state.duration / 1000);
          this.internalTime = state.position;
          this.totalTime = state.duration;
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
            this.onSongEnd();
          }
        });
        // Ready
        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          // tslint:disable-next-line: no-console
          console.log("Ready with Device ID", device_id);
          this.deviceId = device_id;
        });
        // Not Ready
        player.addListener(
          "not_ready",
          ({ device_id }: { device_id: string }) => {
            // tslint:disable-next-line: no-console
            console.log("Device ID has gone offline", device_id);
          },
        );
        // Connect to the player!
        player.connect();
        this.player = player;
      }
    };
  }

  public async play(song: ISong) {
    if (!this.deviceId) {
      return;
    }
    const url = `${this.apiUrl}/me/player/play?device_id=${this.deviceId}`;

    const trackId = song.apiId || "";
    await axios.put(
      url,
      {
        uris: [trackId],
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    this.interval = setInterval(this.updateTime, 1000);
  }

  public pause() {
    this.player.pause();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public resume() {
    this.player.resume();
    this.interval = setInterval(this.updateTime, 1000);
  }

  public seek(timeInSeconds: number) {
    this.player.seek(timeInSeconds * 1000);
  }

  public setVolume(volume: number) {
    this.player.setVolume(volume);
  }

  private updateTime = () => {
    this.internalTime += 1000;
    this.setTime(this.internalTime / 1000, this.totalTime / 1000);
  };
}

export default SpotifyPlayer;
