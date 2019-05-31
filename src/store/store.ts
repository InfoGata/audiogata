import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from 'redux-thunk';
import { playerReducer } from "./reducers/playerReducer";
import { songReducer } from "./reducers/songReducer";

const rootReducer = combineReducers({
  player: playerReducer,
  song: songReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

const store = createStore(rootReducer, compose(applyMiddleware(thunk)));

export default store;