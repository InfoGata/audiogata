import MuiDrawer from "@mui/material/Drawer";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { navbarWidth } from "../utils";
import Navigation from "./Navigation";
import { makeStyles } from "tss-react/mui";
import { CSSObject, styled, Theme } from "@mui/material/styles";

const useStyles = makeStyles()((theme) => ({
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
}));
const openedMixin = (theme: Theme): CSSObject => ({
  width: navbarWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: navbarWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const SideBar: React.FC = () => {
  const { classes, cx } = useStyles();
  const navbarOpen = useSelector((state: AppState) => state.ui.navbarOpen);

  return (
    <Drawer
      variant="permanent"
      open={navbarOpen}
      className={cx(classes.drawer, {
        [classes.drawerOpen]: navbarOpen,
        [classes.drawerClose]: !navbarOpen,
      })}
      classes={{
        paper: cx({
          [classes.drawerOpen]: navbarOpen,
          [classes.drawerClose]: !navbarOpen,
        }),
      }}
      anchor="left"
    >
      <DrawerHeader />
      <Navigation />
      <DrawerHeader />
    </Drawer>
  );
};

export default SideBar;
