import { combineReducers } from "redux-starter-kit";
import playlistReducer from "./reducers/playlistReducer";
import settingsReducer from "./reducers/settingsReducer";
import songReducer from "./reducers/songReducer";

const rootReducer = combineReducers({
  playlist: playlistReducer,
  settings: settingsReducer,
  song: songReducer,
});

export default rootReducer