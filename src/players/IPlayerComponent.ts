import { ISong } from "../models";

export interface IPlayerComponent {
  init: () => void;
  setVolume: (volume: number) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  play: (song: ISong) => Promise<void>;
  setAuth?: (accessToken: string) => void;
  setPlaybackRate?: (rate: number) => void;
}
