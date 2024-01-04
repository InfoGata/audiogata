import { Box, Button, CssBaseline } from "@mui/material";
import isElectron from "is-electron";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import OutsideCallConsumer from "react-outside-call";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, HashRouter } from "react-router-dom";
import callConfig from "./call-config";
import AudioComponent from "./components/AudioComponent";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import PlayerBar from "./layouts/PlayerBar";
import Routing from "./components/Routing";
import SideBar from "./layouts/SideBar";
import TopBar from "./layouts/TopBar";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import ItemMenuProvider from "./providers/ItemMenuProvider";
import PluginsProvider from "./providers/PluginsProvider";
import TrackMenuProvider from "./providers/TrackMenuProvider";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";

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
