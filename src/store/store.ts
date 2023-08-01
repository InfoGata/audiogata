import {
  AnyAction,
  PreloadedState,
  ThunkAction,
  configureStore,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["track", "settings"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const setupStore = (preloadedState?: PreloadedState<AppState>) => {
  return configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Setting to false because it causes a warning when using redux-persist
        serializableCheck: false,
      }),
    reducer: persistedReducer,
    preloadedState,
  });
};

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept("./rootReducer", (newModule) => {
    if (newModule) {
      store.replaceReducer(persistReducer(persistConfig, newModule.default));
    }
  });
}

const store = setupStore();
export const persistor = persistStore(store);
export type AppState = ReturnType<typeof persistedReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  undefined,
  AnyAction
>;
export default store;
