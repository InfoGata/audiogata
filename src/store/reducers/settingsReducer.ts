import { createSlice } from "@reduxjs/toolkit";

interface ISettings {
  playOnStartup: boolean;
}

const initialState: ISettings = {
  playOnStartup: false
};

const settingsSlice = createSlice({
  name: "song",
  initialState,
  reducers: {
    togglePlayOnStartup: (state) => {
      return {
        ...state,
        playOnStartup: !state.playOnStartup
      };
    }
  },
});

export const { togglePlayOnStartup } = settingsSlice.actions;
export default settingsSlice.reducer;