import axios from "axios";
import React, { Component } from "react";
import { IAlbum, IArtist, ISong } from "../services/data/database";

interface ISpotifyState {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  player: any;
}

interface ISpotifyResult {
  albums: ISpotifyAlbumResult;
  artists: ISpotifyArtistResult;
  tracks: ISpotifyTrackResult;
}

interface ISpotifyAlbumResult {
  items: ISpotifyAlbum[];
}

interface ISpotifyAlbum {
  name: string;
  uri: string;
}

interface ISpotifyArtistResult {
  items: ISpotifyArtist[];
}

interface ISpotifyArtist {
  name: string;
  uri: string;
}

interface ISpotifyTrackResult {
  items: ISpotifyTrack[];
}

interface ISpotifyTrack {
  name: string;
  uri: string;
}

declare var Spotify: any;
class SpotifyComponent extends Component<{}, ISpotifyState> {
  private readonly apiUrl = "https://api.spotify.com/v1";
  private readonly serverUrl = "http://localhost:8888";
  constructor(props: any) {
    super(props);
    let accessToken = "";
    let refreshToken = "";
    const query = new URLSearchParams(window.location.search);
    if (query.has("access_token") && query.has("refresh_token")) {
      accessToken = query.get("access_token") || "";
      refreshToken = query.get("refresh_token") || "";
    }
    this.state = {
      accessToken,
      deviceId: "",
      player: null,
      refreshToken,
    };
  }

  public async componentDidMount() {
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

  public async searchAll(query: string) {
    const url = `${this.apiUrl}/search?q=${encodeURIComponent(
      query,
    )}&type=album,artist,track`;
    const results = await axios.get<ISpotifyResult>(url, {
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
      },
    });
    const data = results.data;
    const tracks = this.trackResultToSong(data.tracks.items);
    const albums = this.albumResultToAlbum(data.albums.items);
    const artists = this.artistResultToArtist(data.artists.items);
    return { tracks, albums, artists };
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

  public togglePlayer() {
    this.state.player.togglePlay();
  }

  public seek(timeInMilliseconds: number) {
    this.state.player.seek(timeInMilliseconds);
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

  private trackResultToSong(results: ISpotifyTrack[]): ISong[] {
    return results.map(
      r =>
        ({
          apiId: r.uri,
          from: "spotify",
          name: r.name,
          useBlob: false,
        } as ISong),
    );
  }

  private artistResultToArtist(results: ISpotifyArtist[]): IArtist[] {
    return results.map(
      r =>
        ({
          apiId: r.uri,
          from: "napster",
          name: r.name,
        } as IArtist),
    );
  }

  private albumResultToAlbum(results: ISpotifyAlbum[]): IAlbum[] {
    return results.map(
      r =>
        ({
          apiId: r.uri,
          from: "napster",
          name: r.name,
        } as IAlbum),
    );
  }
}

export default SpotifyComponent;
