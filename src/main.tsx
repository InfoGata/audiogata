import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import store, { persistor } from "./store/store";
import { ThemeProvider } from "./providers/ThemeProvider";
import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import isElectron from "is-electron";
import { routeTree } from "./routeTree.gen";
import { Album, Artist, PlaylistInfo } from "./plugintypes";

Sentry.init({
  dsn: "https://d99bb253ac5a4b53a32d48697f165e34@app.glitchtip.com/4798",
});

const history = isElectron() ? createHashHistory() : createBrowserHistory();
const router = createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    playlistInfo?: PlaylistInfo;
    album?: Album;
    artist?: Artist;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="dark">
          <IconContext.Provider value={{ className: "w-5 h-5" }}>
            <RouterProvider router={router} />
          </IconContext.Provider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
