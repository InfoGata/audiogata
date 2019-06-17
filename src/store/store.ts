import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import { playerReducer } from "./reducers/playerReducer";
import { playlistReducer } from "./reducers/playlistReducer";
import { songReducer } from "./reducers/songReducer";

const rootReducer = combineReducers({
  player: playerReducer,
  playlist: playlistReducer,
  song: songReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["player"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export type AppState = ReturnType<typeof persistedReducer>;

const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunk)));
export const persistor = persistStore(store);
export default store;
