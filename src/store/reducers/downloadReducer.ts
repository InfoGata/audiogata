import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AudioBlob, db } from "../../database";
import { Track } from "../../types";
import { AppActionCreator } from "../store";
import { Capacitor } from "@capacitor/core";

interface TrackProgress {
  trackId: string;
  progress: number;
  success?: boolean;
}

interface DownloadReducerState {
  progress: { [k: string]: TrackProgress };
}

const initialState: DownloadReducerState = {
  progress: {},
};

const downloadsSlice = createSlice({
  name: "download",
  initialState,
  reducers: {
    downloadTrack: (state, action: PayloadAction<Track>) => {
      const trackId = action.payload.id || "";
      const newDownload: TrackProgress = {
        trackId: action.payload.id || "",
        progress: 0,
      };
      state.progress[trackId] = newDownload;
    },
    setDownloadProgress: (state, action: PayloadAction<TrackProgress>) => {
      state.progress[action.payload.trackId].progress = action.payload.progress;
    },
    downloadSuccess: (state, action: PayloadAction<string>) => {
      state.progress[action.payload].success = true;
    },
    downloadFailure: (state, action: PayloadAction<string>) => {
      state.progress[action.payload].success = false;
    },
    removeDownload: (state, action: PayloadAction<string>) => {
      delete state.progress[action.payload];
    },
  },
});

export const downloadTrack: AppActionCreator =
  (track: Track, url: string) => async (dispatch) => {
    dispatch(downloadsSlice.actions.downloadTrack(track));
    let response: Response | undefined = undefined;
    let blob: Blob;
    try {
      if (Capacitor.isNativePlatform()) {
        // TODO: add progress when using mobile
        response = await window.cordovaFetch(url);
        blob = await response.blob();
      } else if (typeof window.MediaGata !== "undefined") {
        // TODO: Implement downloads when using MediaGata extension
        const extensionResponse = await window.MediaGata.networkRequest(url);
        blob = extensionResponse.body;
        dispatch(downloadsSlice.actions.downloadFailure(track.id || ""));
      } else {
        try {
          response = await fetch(url);
        } catch {}
        // Error maybe because of cors so try a the proxy
        if (!response) {
          response = await fetch(`http://localhost:8085/${url}`);
        }
        const reader = response.body?.getReader();
        if (response.headers.has("Content-Length") && reader) {
          const contentLenghStr = response.headers.get("Content-Length") || "";
          const contentLength = +contentLenghStr;
          let receivedLength = 0;
          let chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            chunks.push(value || new Uint8Array());
            receivedLength += value?.length || 0;
            const progress = (receivedLength / contentLength) * 100;
            dispatch(
              downloadsSlice.actions.setDownloadProgress({
                trackId: track.id || "",
                progress,
              })
            );
          }

          blob = new Blob(chunks);
        } else {
          blob = await response.blob();
        }
      }
      const audioBlob: AudioBlob = {
        id: track.id || "",
        blob: blob,
      };
      await db.audioBlobs.add(audioBlob);
      dispatch(downloadsSlice.actions.downloadSuccess(track.id || ""));
    } catch {
      dispatch(downloadsSlice.actions.downloadFailure(track.id || ""));
    }
  };

export const { removeDownload } = downloadsSlice.actions;
export default downloadsSlice.reducer;
