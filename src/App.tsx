import { Box, Button, CssBaseline } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import Routing from "./components/Routing";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import { PluginsProvider } from "./PluginsContext";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";
import { QueryClient, QueryClientProvider } from "react-query";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import { TrackMenuProvider } from "./TrackMenuContext";
import { useTranslation } from "react-i18next";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const onClickDismiss = (key: SnackbarKey) => () => {
    notistackRef?.current?.closeSnackbar(key);
  };
  const { t } = useTranslation();

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => (
        <Button onClick={onClickDismiss(key)}>{t("dismiss")}</Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MatomoRouterProvider>
            <PluginsProvider>
              <TrackMenuProvider>
                <Box sx={{ display: "flex" }}>
                  <CssBaseline />
                  <TopBar />
                  <SideBar />
                  <Routing />
                  <PlayerBar />
                  <AudioComponent />
                </Box>
              </TrackMenuProvider>
            </PluginsProvider>
          </MatomoRouterProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
