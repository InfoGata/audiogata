import { Box, CssBaseline } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <TopBar />
        <SideBar />
        <Routes />
        <PlayerBar />
        <AudioComponent />
      </Box>
    </BrowserRouter>
  );
};

export default App;
