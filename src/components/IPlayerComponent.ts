import { ISong } from "../services/data/database";

export interface IPlayerComponent {
  setVolume: (volume: number) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  play: (song: ISong) => Promise<void>;
}
