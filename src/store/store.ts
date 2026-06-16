import { ThunkAction, UnknownAction, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storageImport from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";

// redux-persist ships CJS that sets `exports.__esModule = true` via assignment,
// which Vite 8's Rolldown dep optimizer doesn't detect, so the default import
// resolves to `{ default: WebStorage }` instead of the WebStorage object.
// Unwrap defensively so it works under both the old (esbuild) and new optimizer.
const storage =
  (storageImport as unknown as { default?: typeof storageImport }).default ??
  storageImport;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["track", "settings"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Setting to false because it causes a warning when using redux-persist
      serializableCheck: false,
    }),
  reducer: persistedReducer,
});

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept("./rootReducer", (newModule) => {
    if (newModule) {
      store.replaceReducer(persistReducer(persistConfig, newModule.default));
    }
  });
}

export const persistor = persistStore(store);
export type AppState = ReturnType<typeof persistedReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  undefined,
  UnknownAction
>;
export default store;
