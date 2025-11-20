import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom/client";
import { PostHogProvider } from "posthog-js/react";
import { IconContext } from "react-icons";
import OutsideCallConsumer from "react-outside-call";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import callConfig from "./call-config";
import "./i18n";
import "./index.css";
import PluginsProvider from "./providers/PluginsProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import Router from "./router";
import store, { persistor } from "./store/store";
import { ChatBotProvider } from "react-chatbotify";
import { ExtensionProvider } from "./contexts/ExtensionContext";

Sentry.init({
  dsn: "https://d99bb253ac5a4b53a32d48697f165e34@app.glitchtip.com/4798",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: import.meta.env.MODE === "development",
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider defaultTheme="dark">
            <ExtensionProvider>
              <IconContext.Provider value={{ className: "size-5" }}>
                <QueryClientProvider client={queryClient}>
                  <PluginsProvider>
                    <OutsideCallConsumer config={callConfig}>
                      <ChatBotProvider>
                        <Router />
                      </ChatBotProvider>
                    </OutsideCallConsumer>
                  </PluginsProvider>
                </QueryClientProvider>
              </IconContext.Provider>
            </ExtensionProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </PostHogProvider>
  </React.StrictMode>
);
