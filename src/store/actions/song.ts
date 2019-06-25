import { Dispatch } from "redux";
import { ISong } from "../../services/data/database";
import { db } from "../../services/data/database";

export const ADD_TRACK = "ADD_TRACK";
export const DELETE_TRACK = "DELETE_TRACK";
export const LOAD_TRACKS = "LOAD_TRACKS";
export const CLEAR_TRACKS = "CLEAR_TRACKS";

interface IAddTrack {
  type: typeof ADD_TRACK;
  track: ISong;
}

async function getNextOrder() {
  const lastItem = await db.songs.orderBy("sortOrder").last();
  const maxOrder = lastItem ? lastItem.sortOrder : 0;
  return maxOrder + 1;
}

export function addTrack(track: ISong) {
  return async (dispatch: Dispatch) => {
    const nextOrder = await getNextOrder();
    track.sortOrder = nextOrder;
    const id = await db.songs.put(track);
    track.id = id;
    dispatch({
      track,
      type: ADD_TRACK,
    });
  };
}

interface IDeleteTrack {
  type: typeof DELETE_TRACK;
  track: ISong;
}

export function deleteTrack(track: ISong) {
  return async (dispatch: Dispatch) => {
    if (track.id) {
      await db.songs.delete(track.id);
    }
    dispatch({
      track,
      type: DELETE_TRACK,
    });
  };
}


interface ILoadTracks {
  type: typeof LOAD_TRACKS;
  tracks: ISong[];
}

export function loadTracks() {
  return async (dispatch: Dispatch): Promise<void> => {
    const songs = await db.songs.orderBy("sortOrder").toArray();
    dispatch({
      tracks: songs,
      type: LOAD_TRACKS,
    });
  };
}

interface IClearTracks {
  type: typeof CLEAR_TRACKS;
  tracks: ISong[];
}

export function clearTracks() {
  return async (dispatch: Dispatch): Promise<void> => {
    await db.songs.clear();
    dispatch({
      type: CLEAR_TRACKS,
    });
  };
}

export type TrackActions = IAddTrack | IDeleteTrack | ILoadTracks | IClearTracks;