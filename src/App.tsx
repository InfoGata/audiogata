import { Box, CssBaseline } from "@mui/material";
import React from "react";
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
import PluginsProvider from "./providers/PluginsProvider";
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
  const dispatch = useAppDispatch();
  useUpdateServiceWorker();
  useOffline();

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <MatomoRouterProvider>
        <PluginsProvider>
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
        </PluginsProvider>
      </MatomoRouterProvider>
    </QueryClientProvider>
  );
};

export default App;
