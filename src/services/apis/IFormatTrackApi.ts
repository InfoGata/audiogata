import { ISong } from "../data/database";

export interface IFormatTrackApi {
  getTrackUrl: (song: ISong) => Promise<string>;
}
