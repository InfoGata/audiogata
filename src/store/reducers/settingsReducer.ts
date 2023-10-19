import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  playOnStartup: boolean;
  corsProxyUrl?: string;
  currentPluginId?: string;
  showForwardAndRewind?: boolean;
  customFowardAndRewindTime?: number;
  disableAutoUpdatePlugins?: boolean;
  lyricsPluginId?: string;
  pluginsPreinstalled?: boolean;
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
    toggleDisableAutoUpdatePlugins: (state) => {
      return {
        ...state,
        autoUpdatePlugins: !state.disableAutoUpdatePlugins,
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
    saveCustomFowardAndRewindTime: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        customFowardAndRewindTime: action.payload,
      };
    },
    setCurrentPluginId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentPluginId: action.payload,
      };
    },
    setLyricsPluginId: (state, action: PayloadAction<string | undefined>) => {
      return { ...state, lyricsPluginId: action.payload };
    },
    setPluginsPreInstalled: (state) => {
      return { ...state, pluginsPreinstalled: true };
    },
  },
});

export const {
  togglePlayOnStartup,
  saveCorsProxyUrl,
  setCurrentPluginId,
  saveShowForwardAndRewind,
  saveCustomFowardAndRewindTime,
  toggleDisableAutoUpdatePlugins,
  setLyricsPluginId,
  setPluginsPreInstalled,
} = settingsSlice.actions;
export default settingsSlice.reducer;
