import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { navbarWidth } from "../utils";
import Navigation from "./Navigation";

const useStyles = makeStyles({
  drawer: {
    flexShrink: 0,
    width: navbarWidth,
  },
  drawerPaper: {
    width: navbarWidth,
  },
});

const SideBar: React.FC = () => {
  const classes = useStyles();
  const navbarOpen = useSelector((state: AppState) => state.ui.navbarOpen);

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      open={navbarOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <Navigation />
    </Drawer>
  );
};

export default SideBar;
