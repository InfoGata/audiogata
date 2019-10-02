import React from "react";
import { Route } from "react-router-dom";
import Home from "./Home";
import Playlist from "./Playlist";
import Plugins from "./Plugins";
import Settings from "./Settings";
import Sync from "./Sync";
import { Theme, makeStyles, createStyles } from "@material-ui/core/styles";
import { navbarWidth } from "../utils";
import { AppState } from "../store/store";
import clsx from "clsx";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      marginLeft: -navbarWidth,
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        duration: theme.transitions.duration.leavingScreen,
        easing: theme.transitions.easing.sharp,
      }),
    },
    contentShift: {
      marginLeft: 0,
      transition: theme.transitions.create("margin", {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeOut,
      }),
    },
    drawerHeader: {
      alignItems: "center",
      display: "flex",
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: "flex-end",
    },
  }),
);

const Routes: React.FC = () => {
  const classes = useStyles();
  const navbarOpen = useSelector((state: AppState) => state.ui.navbarOpen);
  return (
    <main
        className={clsx(classes.content, {
          [classes.contentShift]: navbarOpen,
        })}
    >
      <div className={classes.drawerHeader} />
      <Route exact={true} path="/" component={Home} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/sync" component={Sync} />
      <Route exact={true} path="/playlist/:id" component={Playlist} />
      <Route exact={true} path="/settings" component={Settings} />
    </main>
  );
};

export default Routes;
