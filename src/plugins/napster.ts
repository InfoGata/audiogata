import axios from "axios";
import { IAlbum, IArtist, IImage, IPlaylist, ISong } from "../models";
import { ISearchApi } from "../plugins/ISearchApi";
import { IPlayerComponent } from "./IPlayerComponent";
import { UserManager, UserManagerSettings } from 'oidc-client';

declare var Napster: any;

interface INapsterResult {
  search: INapsterSearch;
}

interface INapsterSearch {
  data: INapsterData;
}

interface INapsterData {
  artists: INapsterArtist[];
  albums: INapsterAlbum[];
  tracks: INapsterTrack[];
}

interface INapsterArtist {
  id: string;
  name: string;
}

interface INapsterAlbum {
  id: string;
  name: string;
  artistName: string;
  contributingArtists: IContributingArtists;
}

interface IContributingArtists {
  primaryArtist: string;
}

interface INapsterTrack {
  id: string;
  name: string;
  playbackSeconds: number;
  albumId: string;
  artistId: string;
  artistName: string;
}

const apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
const path = "https://api.napster.com/v2.2";
const napsterOauthUrl = `https://api.napster.com/oauth/authorize`;

async function searchTracks(query: string) {
  const url = `${path}/search?apikey=${
    apiKey
    }&query=${encodeURIComponent(query)}&type=track`;
  try {
    const results = await axios.get<INapsterResult>(url);
    const tracks = results.data.search.data.tracks;
    return trackResultToSong(tracks);
  } catch {
    return [];
  }
}

async function searchArtists(query: string) {
  const url = `${path}/search?apikey=${
    apiKey
    }&query=${encodeURIComponent(query)}&type=artist`;
  try {
    const results = await axios.get<INapsterResult>(url);
    const artists = results.data.search.data.artists;
    return aristResultToArtist(artists);
  } catch {
    return [];
  }
}

async function searchAlbums(query: string) {
  const url = `${path}/search?apikey=${
    apiKey
    }&query=${encodeURIComponent(query)}&type=album`;
  try {
    const results = await axios.get<INapsterResult>(url);
    const albums = results.data.search.data.albums;
    return albumResultToAlbum(albums);
  } catch {
    return [];
  }
}

function albumResultToAlbum(results: INapsterAlbum[]): IAlbum[] {
  return results.map(
    r =>
      ({
        apiId: r.id.toString(),
        artistId: r.contributingArtists.primaryArtist,
        artistName: r.artistName,
        from: "napster",
        name: r.name,
      } as IAlbum),
  );
}

function aristResultToArtist(results: INapsterArtist[]): IArtist[] {
  return results.map(
    r =>
      ({
        apiId: r.id.toString(),
        from: "napster",
        name: r.name,
      } as IArtist),
  );
}

function getImages(albumId: string): IImage[] {
  const sizes = [70, 170, 200, 300, 500];
  return sizes.map(s => ({
    height: s,
    url: `https://api.napster.com/imageserver/v2/albums/${albumId}/images/${s}x${s}.jpg`,
    width: s
  }));
}

function trackResultToSong(results: INapsterTrack[]): ISong[] {
  return results.map(
    r =>
      ({
        albumId: r.albumId,
        apiId: r.id,
        artistId: r.artistId,
        artistName: r.artistName,
        duration: r.playbackSeconds,
        from: "napster",
        images: getImages(r.albumId),
        name: r.name,
      } as ISong),
  );
}

class NapsterPlayer implements IPlayerComponent, ISearchApi {
  public name = "napster";
  private readonly apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  public setTime?: (elapsed: number, total: number) => void;
  public onSongEnd?: () => void;

  constructor() {
    this.loadScripts();
  }

  private loadScripts() {
    const scripts = [
      "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js",
      "https://cdn.jsdelivr.net/gh/Napster/napster.js@master/napster.min.js",
    ];

    scripts.forEach((url, index) => {
      const script = document.createElement('script');
      script.type = "text/javascript";
      script.async = false;
      script.defer = true;
      script.src = url;
      document.head.appendChild(script);
    });
  }

  public init() {
  }

  public initalizePlayer(accessToken: string, refreshToken?: string) {
    Napster.init({
      consumerKey: this.apiKey,
      isHTML5Compatible: true,
    });
    Napster.player.on("ready", () => {
      Napster.member.set({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
      Napster.player.auth();
      Napster.player.on("playevent", (e: any) => {
        if (e.data.code === "PlayComplete") {
          if (this.onSongEnd) {
            this.onSongEnd();
          }
        }
      });
      Napster.player.on("playtimer", (e: any) => {
        const current = e.data.currentTime;
        const duration = e.data.totalTime;
        if (this.setTime) {
          this.setTime(current, duration);
        }
      });
    });

  }

  public async play(song: ISong) {
    const id = song.apiId || "";
    Napster.player.play(id);
  }

  public pause() {
    if (Napster.player) {
      Napster.player.pause();
    }
  }

  public resume() {
    Napster.player.resume();
  }

  public seek(time: number) {
    Napster.player.seek(time);
  }

  public setVolume(volume: number) {
    if (Napster && Napster.player) {
      Napster.player.setVolume(volume);
    }
  }
  
  public async searchAll(query: string) {
    const [tracks, albums, artists] = await Promise.all([
      searchTracks(query),
      searchAlbums(query),
      searchArtists(query),
    ]);
    return { tracks, albums, artists };
  };

  public async getAlbumTracks(album: IAlbum) {
    const url = `${path}/albums/${album.apiId}/tracks?apikey=${
      apiKey
      }`;
    try {
      const results = await axios.get<INapsterData>(url);
      const tracks = results.data.tracks;
      return trackResultToSong(tracks);
    } catch {
      return [];
    }
  };

  public async getArtistAlbums(artist: IArtist) {
    const url = `${path}/artists/${artist.apiId}/albums/top?apikey=${
      apiKey
      }`;
    try {
      const results = await axios.get<INapsterData>(url);
      const albums = results.data.albums;
      return albumResultToAlbum(albums);
    } catch {
      return [];
    }
  }

  public async getPlaylistTracks(_playlist: IPlaylist) {
    return []
  }

  public async login(clientId: string, secretKey: string) {
    const settings: UserManagerSettings = {
      authority: "https://api.napster.com",
      client_id: clientId,
      client_secret: secretKey,
      response_type: "code",
      redirect_uri: "http://localhost:3000",
      popup_redirect_uri: window.origin + "/audio-pwa/login_popup.html",
      metadata: {
        authorization_endpoint: napsterOauthUrl,
        token_endpoint: "https://api.napster.com/oauth/access_token",
        userinfo_endpoint: "https://api.napster.com/v2.2/me/account",
      },
    };
    const userManager = new UserManager(settings);
    const user= await userManager.signinPopup();
    this.initalizePlayer(user.access_token, user.refresh_token);
  }
}

export default new NapsterPlayer();