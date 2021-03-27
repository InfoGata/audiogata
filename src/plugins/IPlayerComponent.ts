import { ISong } from "../models";

export interface IPlayerComponent {
  name: string;
  init: () => void;
  setVolume: (volume: number) => Promise<void> | void;
  pause: () => Promise<void> | void;
  resume: () => Promise<void> | void;
  seek: (time: number) => Promise<void> | void;
  play: (song: ISong) => Promise<void> | void;
  setPlaybackRate?: (rate: number) => void;
}
