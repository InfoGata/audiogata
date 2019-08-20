import { ISong } from "../../services/data/database";

export const ADD_TRACK = "ADD_TRACK";
export const DELETE_TRACK = "DELETE_TRACK";
export const CLEAR_TRACKS = "CLEAR_TRACKS";
export const SET_TRACKS = "SET_TRACKS";

interface IAddTrack {
  type: typeof ADD_TRACK;
  track: ISong;
}

export function addTrack(track: ISong): IAddTrack {
  return {
    track,
    type: ADD_TRACK,
  };
}

interface IDeleteTrack {
  type: typeof DELETE_TRACK;
  track: ISong;
}

export function deleteTrack(track: ISong): IDeleteTrack {
  return {
    track,
    type: DELETE_TRACK,
  };
}

interface IClearTracks {
  type: typeof CLEAR_TRACKS;
}

export function clearTracks(): IClearTracks {
  return {
    type: CLEAR_TRACKS
  };
}

interface ISetTracks {
  type: typeof SET_TRACKS;
  tracks: ISong[];
}

export function setTracks(tracks: ISong[]): ISetTracks {
  return {
    tracks,
    type: SET_TRACKS,
  };
}

export type TrackActions = IAddTrack | IDeleteTrack | IClearTracks | ISetTracks;
