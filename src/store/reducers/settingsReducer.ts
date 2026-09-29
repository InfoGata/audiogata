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
  // Optional, like the settings above, so state persisted before it existed
  // reads as "not disabled". See lib/analytics.
  disableAnalytics?: boolean;
  cloudSync?: CloudSyncSettings;
}

export interface CloudSyncSettings {
  /** The sync plugin chosen in Settings; sync is off without one. */
  pluginId?: string;
  autoSync: boolean;
  syncIntervalSeconds: number;
}

export const defaultCloudSync: CloudSyncSettings = {
  autoSync: true,
  syncIntervalSeconds: 60,
};

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
        disableAutoUpdatePlugins: !state.disableAutoUpdatePlugins,
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
    setDisableAnalytics: (state, action: PayloadAction<boolean>) => {
      return { ...state, disableAnalytics: action.payload };
    },
    updateCloudSync: (
      state,
      action: PayloadAction<Partial<CloudSyncSettings>>
    ) => {
      return {
        ...state,
        cloudSync: {
          ...defaultCloudSync,
          ...state.cloudSync,
          ...action.payload,
        },
      };
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
  setDisableAnalytics,
  updateCloudSync,
} = settingsSlice.actions;
export default settingsSlice.reducer;
