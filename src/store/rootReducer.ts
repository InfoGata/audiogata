import { combineReducers } from "@reduxjs/toolkit";
import playlistReducer from "./reducers/playlistReducer";
import settingsReducer from "./reducers/settingsReducer";
import songReducer from "./reducers/songReducer";
import uiReducer from "./reducers/uiReducer";
import pluginReducer from "./reducers/pluginReducer";

const rootReducer = combineReducers({
  playlist: playlistReducer,
  settings: settingsReducer,
  song: songReducer,
  ui: uiReducer,
  plugin: pluginReducer
});

export default rootReducer