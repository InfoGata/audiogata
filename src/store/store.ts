import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { AnyAction, configureStore, ThunkAction } from "@reduxjs/toolkit";
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

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./rootReducer", () => {
    const newRootReducer = require("./rootReducer").default;
    store.replaceReducer(persistReducer(persistConfig, newRootReducer));
  });
}

export const persistor = persistStore(store);
export type AppState = ReturnType<typeof persistedReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  AnyAction
>;
export default store;
