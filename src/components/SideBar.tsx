import Drawer from "@material-ui/core/Drawer";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import clsx from "clsx";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { navbarWidth } from "../utils";
import Navigation from "./Navigation";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      flexShrink: 0,
      whiteSpace: "nowrap",
      width: navbarWidth,
    },
    drawerClose: {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        duration: theme.transitions.duration.leavingScreen,
        easing: theme.transitions.easing.sharp,
      }),
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(7) + 1,
      },
    },
    drawerOpen: {
      transition: theme.transitions.create("width", {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.sharp,
      }),
      width: navbarWidth,
    },
    toolbar: theme.mixins.toolbar,
  }),
);

const SideBar: React.FC = () => {
  const classes = useStyles();
  const navbarOpen = useSelector((state: AppState) => state.ui.navbarOpen);

  return (
    <Drawer
      variant="permanent"
      open={navbarOpen}
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: navbarOpen,
        [classes.drawerClose]: !navbarOpen,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: navbarOpen,
          [classes.drawerClose]: !navbarOpen,
        }),
      }}
      anchor="left"
    >
      <div className={classes.toolbar} />
      <Navigation />
      <div className={classes.toolbar} />
    </Drawer>
  );
};

export default SideBar;
