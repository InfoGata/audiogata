import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { PluginInfo } from "../../models";

export interface PluginState {
  plugins: PluginInfo[];
}

const initialState: PluginState = {
  plugins: [],
};

const pluginSlice = createSlice({
  name: "plugin",
  initialState,
  reducers: {
    addPlugin(state, action: PayloadAction<PluginInfo>) {
      action.payload.id = nanoid();
      state.plugins.push(action.payload);
    },
    deletePlugin(state, action: PayloadAction<PluginInfo>) {
      return {
        ...state,
        playlists: state.plugins.filter((p) => p.id !== action.payload.id),
      };
    },
  },
});

export const { addPlugin } = pluginSlice.actions;
export default pluginSlice.reducer;
