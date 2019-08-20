import { ISong } from "../services/data/database";

export interface IPlayerComponent {
  init: () => void;
  setVolume: (volume: number) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  play: (song: ISong) => Promise<void>;
  setAuth?: (accessToken: string, refreshToken: string) => void;
}
