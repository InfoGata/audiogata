import { ISong } from "../models";

export interface IPlayerComponent {
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  play: (song: ISong) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
}

export type PlayerComponentType = keyof IPlayerComponent;
