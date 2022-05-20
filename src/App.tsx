import { Box, Button, CssBaseline } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import { PluginsProvider } from "./PluginsContext";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const notistackRef = React.createRef<SnackbarProvider>();
  const onClickDismiss = (key: SnackbarKey) => () => {
    notistackRef?.current?.closeSnackbar(key);
  };

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
    >
      <BrowserRouter>
        <PluginsProvider>
          <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <TopBar />
            <SideBar />
            <Routes />
            <PlayerBar />
            <AudioComponent />
          </Box>
        </PluginsProvider>
      </BrowserRouter>
    </SnackbarProvider>
  );
};

export default App;
