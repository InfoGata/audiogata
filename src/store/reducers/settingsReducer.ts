import { createSlice } from "redux-starter-kit";

interface ISettings {
  playOnStartup: boolean;
}

const initialState: ISettings = {
  playOnStartup: false
};

const settingsSlice = createSlice({
  initialState,
  reducers: {
    togglePlayOnStartup: (state) => {
      return {
        ...state,
        playOnStartup: !state.playOnStartup
      };
    }
  },
  slice: "settings",
});

export const { togglePlayOnStartup } = settingsSlice.actions;
export default settingsSlice.reducer;