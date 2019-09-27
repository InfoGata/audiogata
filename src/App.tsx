import {
  createStyles,
  CssBaseline,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import React, { Component } from "react";
import { hot } from "react-hot-loader/root";
import { BrowserRouter as Router } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AudioComponent from "./components/AudioComponent";
import PlayerBar from "./components/PlayerBar";
import QueueBar from "./components/QueueBar";
import Routes from "./components/Routes";
import SideBar from "./components/SideBar";

const styles = (_: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
  });

interface IProps extends WithStyles<typeof styles> {}

class App extends Component<IProps> {
  public render() {
    const { classes } = this.props;
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
  }

  // private setMediaSessionMetaData() {
  //   if (navigator && navigator.mediaSession) {
  //     if (this.props.currentSong) {
  //       navigator.mediaSession.metadata = new MediaMetadata({
  //         title: this.props.currentSong.name,
  //       });
  //     }
  //   }
  // }

  // private setMediaSessionActions() {
  //   if (navigator && navigator.mediaSession) {
  //     navigator.mediaSession.setActionHandler("previoustrack", () => {
  //       this.onPreviousClick();
  //     });
  //     navigator.mediaSession.setActionHandler("nexttrack", () => {
  //       this.onNextClick();
  //     });
  //   }
  // }
}

const styledComponent = withStyles(styles, { withTheme: true })(App);
export default process.env.NODE_ENV === "development"
  ? hot(styledComponent)
  : styledComponent;
