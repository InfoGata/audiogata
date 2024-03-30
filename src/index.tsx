import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StyledEngineProvider } from "@mui/material/styles";
import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import router from "./routes";
import store, { persistor } from "./store/store";
import { IconContext } from "react-icons";

Sentry.init({
  dsn: "https://d99bb253ac5a4b53a32d48697f165e34@app.glitchtip.com/4798",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <IconContext.Provider value={{ className: "w-5 h-5" }}>
            <RouterProvider router={router} />
          </IconContext.Provider>
        </PersistGate>
      </Provider>
    </StyledEngineProvider>
  </React.StrictMode>
);
