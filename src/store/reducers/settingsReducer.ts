import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  playOnStartup: boolean;
  corsProxyUrl?: string;
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
    saveCorsProxyUrl: (state, payload: PayloadAction<string | undefined>) => {
      return {
        ...state,
        corsProxyUrl: payload.payload,
      };
    },
  },
});

export const { togglePlayOnStartup, saveCorsProxyUrl } = settingsSlice.actions;
export default settingsSlice.reducer;
