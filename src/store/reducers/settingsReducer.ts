import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  playOnStartup: boolean;
  corsProxyUrl?: string;
  currentPluginId?: string;
}

const initialState: SettingsState = {
  playOnStartup: false,
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
    setCurrentPluginId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentPluginId: action.payload,
      };
    },
  },
});

export const { togglePlayOnStartup, saveCorsProxyUrl, setCurrentPluginId } =
  settingsSlice.actions;
export default settingsSlice.reducer;
