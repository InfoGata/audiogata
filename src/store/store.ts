import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers, configureStore } from "redux-starter-kit";
import playerReducer from "./reducers/playerReducer";
import playlistReducer from "./reducers/playlistReducer";
import songReducer from "./reducers/songReducer";

const rootReducer = combineReducers({
  player: playerReducer,
  playlist: playlistReducer,
  song: songReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["player", "song"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


const store = configureStore({ reducer: persistedReducer });
export const persistor = persistStore(store);
export type AppState = ReturnType<typeof persistedReducer>;
export type AppDispatch = typeof store.dispatch;
export default store;
