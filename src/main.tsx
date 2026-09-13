import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import OutsideCallConsumer from "./lib/outside-call";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import callConfig from "./call-config";
import "./i18n";
import "./index.css";
import { PluginsProvider } from "./contexts/PluginsContext";
import { ThemeProvider } from "@infogata/shadcn-vite-theme-provider";
import Router from "./router";
import store, { persistor } from "./store/store";
import { ExtensionProvider } from "./contexts/ExtensionContext";
import Analytics from "./components/Analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* Inside PersistGate so it acts on the remembered preference
            rather than the default. */}
        <Analytics />
        <ThemeProvider defaultTheme="dark">
          <ExtensionProvider>
            <IconContext.Provider value={{ className: "size-5" }}>
              <QueryClientProvider client={queryClient}>
                <PluginsProvider>
                  <OutsideCallConsumer config={callConfig}>
                    <Router />
                  </OutsideCallConsumer>
                </PluginsProvider>
              </QueryClientProvider>
            </IconContext.Provider>
          </ExtensionProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
