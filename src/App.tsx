import { Box, Button, CssBaseline } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import OutsideCallConsumer from "react-outside-call";
import { QueryClient, QueryClientProvider } from "react-query";
import callConfig from "./call-config";
import AudioComponent from "./components/AudioComponent";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import Routing from "./layouts/MainContainer";
import PlayerBar from "./layouts/PlayerBar";
import SideBar from "./layouts/SideBar";
import TopBar from "./layouts/TopBar";
import ItemMenuProvider from "./providers/ItemMenuProvider";
import PluginsProvider from "./providers/PluginsProvider";
import TrackMenuProvider from "./providers/TrackMenuProvider";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";

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
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
