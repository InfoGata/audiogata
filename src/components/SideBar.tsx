import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import Navigation from "./Navigation";

const drawerWidth = 300;
const useStyles = makeStyles({
  drawer: {
    flexShrink: 0,
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
  },
});

const SideBar: React.FC = () => {
  const classes = useStyles();

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
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
