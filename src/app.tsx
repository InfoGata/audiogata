/**
 * The app itself. Loaded by main.tsx only after any pending data reset has
 * run -- see there for why this can't simply be the entry module.
 */
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
import AppErrorBoundary from "./components/AppErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Outermost on purpose: everything below can throw during first render,
        and the router's error component only covers routes. */}
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  </React.StrictMode>
);
