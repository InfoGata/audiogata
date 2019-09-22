import { ISong } from "../../models";

export interface IFormatTrackApi {
  getTrackUrl: (song: ISong) => Promise<string>;
}
