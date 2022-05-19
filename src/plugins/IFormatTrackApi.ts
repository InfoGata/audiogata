import { ISong } from "../types";

export interface IFormatTrackApi {
  getTrackUrl: (song: ISong) => Promise<string>;
}
