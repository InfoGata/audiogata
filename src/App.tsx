import { CssBaseline } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { hot } from "react-hot-loader/root";
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
    <Router>
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

export default process.env.NODE_ENV === "development" ? hot(App) : App;
