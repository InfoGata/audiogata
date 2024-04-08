import React from "react";
import OutsideCallConsumer from "react-outside-call";
import { QueryClient, QueryClientProvider } from "react-query";
import { Outlet } from "react-router-dom";
import callConfig from "./call-config";
import AudioComponent from "./components/AudioComponent";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import { Toaster } from "./components/ui/sonner";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
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
            <div className="flex h-screen overflow-hidden">
              <Toaster closeButton />
              <TopBar />
              <SideBar />
              <main className="px-2 flex-1 overflow-auto pb-28 pt-20">
                <Outlet />
              </main>
              <PlayerBar />
            </div>
            <AudioComponent />
          </OutsideCallConsumer>
        </PluginsProvider>
      </MatomoRouterProvider>
    </QueryClientProvider>
  );
};

export default App;
