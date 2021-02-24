import { combineReducers } from "@reduxjs/toolkit";
import playlistReducer from "./reducers/playlistReducer";
import settingsReducer from "./reducers/settingsReducer";
import songReducer from "./reducers/songReducer";
import uiReducer from "./reducers/uiReducer";

const rootReducer = combineReducers({
  playlist: playlistReducer,
  settings: settingsReducer,
  song: songReducer,
  ui: uiReducer,
});

export default rootReducer