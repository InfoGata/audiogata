import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  playOnStartup: boolean;
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
  },
});

export const { togglePlayOnStartup } = settingsSlice.actions;
export default settingsSlice.reducer;
