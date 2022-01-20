import { CssBaseline } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-virtualized/styles.css";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";

const useStyles = makeStyles({
  root: {
    display: "flex",
    minHeight: "100vh"
  },
});

const App: React.FC = () => {
  const classes = useStyles();
  return (
    <Router basename="/audio-pwa">
      <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
      <div className={classes.root}>
        <CssBaseline />
        <TopBar />
        <SideBar />
        <Routes />
        <PlayerBar />
        <AudioComponent />
      </div>
    </Router>
  );
};

export default App;
