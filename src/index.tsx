import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import router from "./routes";
import store, { persistor } from "./store/store";
import { ThemeProvider } from "./providers/ThemeProvider";

Sentry.init({
  dsn: "https://d99bb253ac5a4b53a32d48697f165e34@app.glitchtip.com/4798",
});

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
