import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plugin } from "../../models";


export interface PluginState {
  plugins: Plugin[];
}

const initialState: PluginState = {
  plugins: []
}

const pluginSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setPlugin(state, action: PayloadAction<Plugin>) {
      if (state.plugins.some(p => p.name === action.payload.name)) {
        state.plugins = state.plugins.map((p) =>
          p.name === action.payload.name ? action.payload : p
        );
      } else {
        state.plugins.push(action.payload);
      }
    }
  }
});

export const { setPlugin } = pluginSlice.actions;
export default pluginSlice.reducer;
