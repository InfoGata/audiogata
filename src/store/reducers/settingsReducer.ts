import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  playOnStartup: boolean;
  corsProxyUrl?: string;
  currentPluginId?: string;
  showForwardAndRewind?: boolean;
}

const initialState: SettingsState = {
  playOnStartup: false,
  showForwardAndRewind: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    togglePlayOnStartup: (state) => {
      return {
        ...state,
        playOnStartup: !state.playOnStartup,
      };
    },
    saveCorsProxyUrl: (state, action: PayloadAction<string | undefined>) => {
      return {
        ...state,
        corsProxyUrl: action.payload,
      };
    },
    saveShowForwardAndRewind: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        showForwardAndRewind: action.payload,
      };
    },
    setCurrentPluginId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentPluginId: action.payload,
      };
    },
  },
});

export const {
  togglePlayOnStartup,
  saveCorsProxyUrl,
  setCurrentPluginId,
  saveShowForwardAndRewind,
} = settingsSlice.actions;
export default settingsSlice.reducer;
