import { CssBaseline } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { hot } from "react-hot-loader/root";
import { BrowserRouter as Router } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import QueueBar from "./components/QueueBar";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";

const useStyles = makeStyles({
  root: {
    display: "flex",
  },
});

const App: React.FC = () => {
  const classes = useStyles();
  return (
    <Router>
      <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
      <div className={classes.root}>
        <CssBaseline />
        <SideBar />
        <Routes />
        <PlayerBar />
        <QueueBar />
        <AudioComponent />
      </div>
    </Router>
  );
};

export default process.env.NODE_ENV === "development" ? hot(App) : App;
