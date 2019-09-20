import { combineReducers } from "redux-starter-kit";
import playerReducer from "./reducers/playerReducer";
import playlistReducer from "./reducers/playlistReducer";
import songReducer from "./reducers/songReducer";

const rootReducer = combineReducers({
    player: playerReducer,
    playlist: playlistReducer,
    song: songReducer,
});

export default rootReducer