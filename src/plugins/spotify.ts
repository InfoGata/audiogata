import axios from "axios";
import { IAlbum, IArtist, IImage, IPlaylist, ISong } from "../models";
import { ISearchApi } from "./ISearchApi";
import { IPlayerComponent } from "./IPlayerComponent";

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
  artists: ISpotifyArtist[];
  images: IImage[];
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
  duration_ms: number;
  album: ISpotifyAlbum;
  artists: ISpotifyArtist[];
}

type WebPlaybackErrors =
  | 'initialization_error'
  | 'authentication_error'
  | 'account_error'
  | 'playback_error';

interface WebPlaybackError {
  message: WebPlaybackErrors;
}

function trackResultToSong(results: ISpotifyTrack[]): ISong[] {
  return results.map(
    r =>
      ({
        albumId: r.album && r.album.uri,
        apiId: r.uri,
        artistId: r.artists[0].uri,
        artistName: r.artists[0].name,
        duration: r.duration_ms / 1000,
        from: "spotify",
        images: r.album.images,
        name: r.name,
      } as ISong),
  );
}

function artistResultToArtist(results: ISpotifyArtist[]): IArtist[] {
  return results.map(
    r =>
      ({
        apiId: r.uri,
        from: "spotify",
        name: r.name,
      } as IArtist),
  );
}

function albumResultToAlbum(results: ISpotifyAlbum[]): IAlbum[] {
  return results.map(
    r =>
      ({
        apiId: r.uri,
        artistId: r.artists[0].uri,
        artistName: r.artists[0].name,
        from: "spotify",
        name: r.name,
      } as IAlbum),
  );
}


function generateRandomString() {
    var array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

function sha256(plain: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

// Base64-urlencodes the input string
function base64urlencode(str: ArrayBuffer) {
    // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    //   (replace + with -, replace / with _, trim trailing =)
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(str))))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function pkceChallengeFromVerifier(v: string) {
    const hashed = await sha256(v);
    return base64urlencode(hashed);
}



class SpotifyPlayer implements IPlayerComponent, ISearchApi {
  public name = "spotify";
  private readonly apiUrl = "https://api.spotify.com/v1";
  public setTime?: (elapsed: number, total: number) => void;
  public onSongEnd?: () => void;
  private deviceId: string;
  private accessToken: string;
  private internalTime: number;
  private totalTime: number;
  private interval: NodeJS.Timeout | undefined;
  private authorizeUrl = "https://accounts.spotify.com/authorize";
  private tokenUrl = "https://accounts.spotify.com/api/token";
  private clientId = "b8f2fce4341b42e580e66a37302b358e";
  private redirectUri = "http://localhost:3000/audio-pwa/login_popup.html";
  constructor() {
    this.deviceId = "";
    this.accessToken = "";
    this.internalTime = 0;
    this.totalTime = 0;
    this.init();
  }

  public init() {
    (window as any).onSpotifyWebPlaybackSDKReady = this.initializePlayer.bind(
      this
    );
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
      if (this.setTime) {
        this.setTime(state.position / 1000, state.duration / 1000);
      }
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
        if (this.onSongEnd) {
          this.onSongEnd();
        }
      }
    });
    // Ready
    player.addListener("ready", ({ device_id }: { device_id: string }) => {
      console.log("Ready with Device ID", device_id);
      this.deviceId = device_id;
    });
    // Not Ready
    player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
      console.log("Device ID has gone offline", device_id);
    });
    // Connect to the player!
    player.connect();
  };

  private loadScript() {
    const script = document.createElement("script");
    script.id = "spotify-player";
    script.type = "text/javascript";
    script.async = false;
    script.defer = true;
    script.src = "https://sdk.scdn.co/spotify-player.js";
    document.head.appendChild(script);
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
      }
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
        "Content-Type": "application/json",
      },
      method: "PUT",
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

    await fetch(
      `https://api.spotify.com/v1/me/player/seek?position_ms=${
        timeInSeconds * 1000
      }`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      }
    );
  }

  public async setVolume(volume: number) {
    await fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${
        volume * 100
      }`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      }
    );
  }

  private updateTime = () => {
    this.internalTime += 1000;
    if (this.setTime) {
      this.setTime(this.internalTime / 1000, this.totalTime / 1000);
    }
  };

  public async searchAll(query: string) {
    if (!this.accessToken) {
      return { tracks: [], albums: [], artists: [] };
    }
    const url = `${this.apiUrl}/search?q=${encodeURIComponent(
      query
    )}&type=album,artist,track`;
    const results = await axios.get<ISpotifyResult>(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    const data = results.data;
    const tracks = trackResultToSong(data.tracks.items);
    const albums = albumResultToAlbum(data.albums.items);
    const artists = artistResultToArtist(data.artists.items);
    return { tracks, albums, artists };
  }

  public async getAlbumTracks(album: IAlbum) {
    if (!this.accessToken) {
      return [];
    }
    const id = album.apiId.split(":").pop();
    const url = `${this.apiUrl}/albums/${id}/tracks?limit=50`;
    const results = await axios.get<ISpotifyTrackResult>(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    const tracks = trackResultToSong(results.data.items);
    tracks.forEach((t) => {
      t.albumId = album.apiId;
    });
    return tracks;
  }

  public async getArtistAlbums(artist: IArtist) {
    if (!this.accessToken) {
      return [];
    }
    const id = artist.apiId.split(":").pop();
    const url = `${this.apiUrl}/artists/${id}/albums`;
    const results = await axios.get<ISpotifyAlbumResult>(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return albumResultToAlbum(results.data.items);
  }

  public async getPlaylistTracks(_playlist: IPlaylist) {
    return [];
  }

  async getToken(url: URL, savedState: string, codeVerifier: string) {
    const code = url.searchParams.get("code") || "";
    const state = url.searchParams.get("state");
    if (savedState !== state) {
      return;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("client_id", this.clientId);
    params.append("redirect_uri", this.redirectUri);
    params.append("code_verifier", codeVerifier);
    const result = await axios.post(this.tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return result.data;
  }

  async getPkce() {
    const newWindow = window.open();
    const state = generateRandomString();
    const codeVerifier = generateRandomString();
    const codeChallenge = await pkceChallengeFromVerifier(codeVerifier);
    window.onmessage = async (event: MessageEvent) => {
      if (event.source === newWindow) {
        const url = new URL(event.data.url);
        newWindow?.close();
        const result = await this.getToken(url, state, codeVerifier);
        this.accessToken = result.access_token;
        this.loadScript();
      }
    };
    const scopes = "streaming user-read-email user-read-private";
    const url = `${this.authorizeUrl}?response_type=code&client_id=${encodeURIComponent(
      this.clientId
    )}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${encodeURIComponent(
      this.redirectUri
    )}&code_challenge=${encodeURIComponent(
      codeChallenge
    )}&code_challenge_method=S256`;
    if (newWindow) {
      newWindow.location.href = url;
    }
  }

  public async login() {
    await this.getPkce();
  }
}

export default new SpotifyPlayer();
