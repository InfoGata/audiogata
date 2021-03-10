import axios from "axios";
import { ISong } from "../models";
import { IPlayerComponent } from "./IPlayerComponent";


type WebPlaybackErrors =
  | 'initialization_error'
  | 'authentication_error'
  | 'account_error'
  | 'playback_error';

interface WebPlaybackError {
  message: WebPlaybackErrors;
}
class SpotifyPlayer implements IPlayerComponent {
  private readonly apiUrl = "https://api.spotify.com/v1";
  private readonly setTime: (elapsed: number, total: number) => void;
  private readonly onSongEnd: () => void;
  private deviceId: string;
  private accessToken: string;
  private internalTime: number;
  private totalTime: number;
  private interval: NodeJS.Timeout | undefined;
  private scriptLoaded = false;
  constructor(
    setTime: (elapsed: number, total: number) => void,
    onSongEnd: () => void) {

    this.setTime = setTime
    this.onSongEnd = onSongEnd;
    this.deviceId = "";
    this.accessToken = "";
    this.internalTime = 0;
    this.totalTime = 0;
    this.init();
  }


  public init() {
    (window as any).onSpotifyWebPlaybackSDKReady = this.initializePlayer.bind(this);
  }

  private initializePlayer = () => {
    const player = new (window as any).Spotify.Player({
      getOAuthToken: async (cb: (arg0: string) => void) => {
        cb(this.accessToken);
      },
      name: "Web Playback SDK Quick Start Player",
    });
    // Error handling
    player.addListener("initialization_error", (error: WebPlaybackError) => {
      console.error(error);
    });
    player.addListener("authentication_error", (error: WebPlaybackError) => {
      console.error(error);
    });
    player.addListener("account_error", (error: WebPlaybackError) => {
      console.error(error);
    });
    player.addListener("playback_error", (error: WebPlaybackError) => {
      console.error(error);
    });
    // Playback status updates
    player.addListener("player_state_changed", (state: any) => {
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
      console.log("Ready with Device ID", device_id);
      this.deviceId = device_id;
    });
    // Not Ready
    player.addListener(
      "not_ready",
      ({ device_id }: { device_id: string }) => {
        console.log("Device ID has gone offline", device_id);
      }
    );
    // Connect to the player!
    player.connect();
  };

  public setAuth(accessToken: string) {
    this.accessToken = accessToken;
    if (!this.scriptLoaded) {
      const script = document.createElement('script');
      script.id = 'spotify-player';
      script.type = 'text/javascript';
      script.async = false;
      script.defer = true;
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.head.appendChild(script);
    } else {
      this.scriptLoaded = true;
    }
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

  public async pause() {
    if (!this.deviceId) {
      return;
    }

    await fetch(`https://api.spotify.com/v1/me/player/pause`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    });
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public async resume() {
    if (!this.deviceId) {
      return;
    }

    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      }
    );
    this.interval = setInterval(this.updateTime, 1000);
  }

  public async seek(timeInSeconds: number) {
    if (!this.deviceId) {
      return;
    }

    await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${timeInSeconds * 1000}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    });
  }

  public async setVolume(volume: number) {
    await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume * 100}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    });
  }

  private updateTime = () => {
    this.internalTime += 1000;
    this.setTime(this.internalTime / 1000, this.totalTime / 1000);
  };
}

export default SpotifyPlayer;
