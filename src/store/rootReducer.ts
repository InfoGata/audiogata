import { combineReducers } from "@reduxjs/toolkit";
import playlistReducer from "./reducers/playlistReducer";
import settingsReducer from "./reducers/settingsReducer";
import trackReducer from "./reducers/trackReducer";
import uiReducer from "./reducers/uiReducer";
import downloadReducer from "./reducers/downloadReducer";

const rootReducer = combineReducers({
  playlist: playlistReducer,
  settings: settingsReducer,
  track: trackReducer,
  ui: uiReducer,
  download: downloadReducer,
});

export default rootReducer;
