import { combineReducers } from "redux-starter-kit";
import playlistReducer from "./reducers/playlistReducer";
import songReducer from "./reducers/songReducer";

const rootReducer = combineReducers({
  playlist: playlistReducer,
  song: songReducer,
});

export default rootReducer