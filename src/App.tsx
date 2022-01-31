import { Box, CssBaseline } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
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
