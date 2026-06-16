import { ThunkAction, UnknownAction, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";

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
