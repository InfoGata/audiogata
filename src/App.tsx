import { Box, Button, CssBaseline } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import Routing from "./components/Routing";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";
import { QueryClient, QueryClientProvider } from "react-query";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import { useTranslation } from "react-i18next";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import useOffline from "./hooks/useOffline";
import isElectron from "is-electron";
import PluginsProvider from "./providers/PluginsProvider";
import OutsideCallConsumer from "react-outside-call";
import callConfig from "./call-config";
import TrackMenuProvider from "./providers/TrackMenuProvider";
import ItemMenuProvider from "./providers/ItemMenuProvider";

const Router = isElectron() ? HashRouter : BrowserRouter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const onClickDismiss = (key: SnackbarKey) => {
    notistackRef?.current?.closeSnackbar(key);
  };
  useUpdateServiceWorker(notistackRef.current?.enqueueSnackbar, onClickDismiss);
  useOffline(notistackRef.current?.enqueueSnackbar, onClickDismiss);

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => (
        <Button onClick={() => onClickDismiss(key)}>{t("dismiss")}</Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <MatomoRouterProvider>
            <PluginsProvider>
              <TrackMenuProvider>
                <ItemMenuProvider>
                  <OutsideCallConsumer config={callConfig}>
                    <Box sx={{ display: "flex" }}>
                      <CssBaseline />
                      <TopBar />
                      <SideBar />
                      <Routing />
                      <PlayerBar />
                      <AudioComponent />
                    </Box>
                  </OutsideCallConsumer>
                </ItemMenuProvider>
              </TrackMenuProvider>
            </PluginsProvider>
          </MatomoRouterProvider>
        </Router>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
