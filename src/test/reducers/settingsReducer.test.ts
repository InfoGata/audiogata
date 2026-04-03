import { describe, expect, test } from "vitest";
import settingsReducer, {
  togglePlayOnStartup,
  saveCorsProxyUrl,
  saveShowForwardAndRewind,
  saveCustomFowardAndRewindTime,
  setCurrentPluginId,
  toggleDisableAutoUpdatePlugins,
  setLyricsPluginId,
  setPluginsPreInstalled,
} from "../../store/reducers/settingsReducer";

describe("settingsReducer", () => {
  const initialState = {
    playOnStartup: false,
    showForwardAndRewind: false,
  };

  test("should return the initial state", () => {
    expect(settingsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  test("should handle togglePlayOnStartup", () => {
    expect(settingsReducer(initialState, togglePlayOnStartup())).toEqual({
      ...initialState,
      playOnStartup: true,
    });

    const enabledState = { ...initialState, playOnStartup: true };
    expect(settingsReducer(enabledState, togglePlayOnStartup())).toEqual({
      ...enabledState,
      playOnStartup: false,
    });
  });

  test("should handle saveCorsProxyUrl", () => {
    const proxyUrl = "https://cors-proxy.example.com";
    expect(settingsReducer(initialState, saveCorsProxyUrl(proxyUrl))).toEqual({
      ...initialState,
      corsProxyUrl: proxyUrl,
    });

    // Test clearing the URL
    const stateWithUrl = { ...initialState, corsProxyUrl: proxyUrl };
    expect(settingsReducer(stateWithUrl, saveCorsProxyUrl(undefined))).toEqual({
      ...stateWithUrl,
      corsProxyUrl: undefined,
    });
  });

  test("should handle saveShowForwardAndRewind", () => {
    expect(settingsReducer(initialState, saveShowForwardAndRewind(true))).toEqual({
      ...initialState,
      showForwardAndRewind: true,
    });

    const enabledState = { ...initialState, showForwardAndRewind: true };
    expect(settingsReducer(enabledState, saveShowForwardAndRewind(false))).toEqual({
      ...enabledState,
      showForwardAndRewind: false,
    });
  });

  test("should handle saveCustomFowardAndRewindTime", () => {
    const customTime = 15;
    expect(settingsReducer(initialState, saveCustomFowardAndRewindTime(customTime))).toEqual({
      ...initialState,
      customFowardAndRewindTime: customTime,
    });
  });

  test("should handle setCurrentPluginId", () => {
    const pluginId = "test-plugin-id";
    expect(settingsReducer(initialState, setCurrentPluginId(pluginId))).toEqual({
      ...initialState,
      currentPluginId: pluginId,
    });
  });

  test("should handle toggleDisableAutoUpdatePlugins", () => {
    // Test enabling the setting
    expect(settingsReducer(initialState, toggleDisableAutoUpdatePlugins())).toEqual({
      ...initialState,
      autoUpdatePlugins: true,
    });

    // Test toggling with existing value
    const stateWithSetting = { ...initialState, disableAutoUpdatePlugins: true };
    expect(settingsReducer(stateWithSetting, toggleDisableAutoUpdatePlugins())).toEqual({
      ...stateWithSetting,
      autoUpdatePlugins: false,
    });
  });

  test("should handle setLyricsPluginId", () => {
    const pluginId = "lyrics-plugin-id";
    expect(settingsReducer(initialState, setLyricsPluginId(pluginId))).toEqual({
      ...initialState,
      lyricsPluginId: pluginId,
    });

    // Test clearing the plugin ID
    const stateWithId = { ...initialState, lyricsPluginId: pluginId };
    expect(settingsReducer(stateWithId, setLyricsPluginId(undefined))).toEqual({
      ...stateWithId,
      lyricsPluginId: undefined,
    });
  });

  test("should handle setPluginsPreInstalled", () => {
    expect(settingsReducer(initialState, setPluginsPreInstalled())).toEqual({
      ...initialState,
      pluginsPreinstalled: true,
    });
  });

});