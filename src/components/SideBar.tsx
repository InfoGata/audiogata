import MuiDrawer from "@mui/material/Drawer";
import React from "react";
import { navbarWidth } from "../utils";
import Navigation from "./Navigation";
import { CSSObject, styled, Theme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleNavbar } from "../store/reducers/uiReducer";

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

const MiniDrawer = styled(MuiDrawer, {
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
  const navbarOpen = useAppSelector((state) => state.ui.navbarOpen);
  const dispatch = useAppDispatch();

  const onNavbarClose = () => {
    dispatch(toggleNavbar());
  };

  const drawer = (
    <>
      <DrawerHeader />
      <Navigation />
      <DrawerHeader />
    </>
  );

  return (
    <>
      <MiniDrawer
        variant="permanent"
        open={navbarOpen}
        anchor="left"
        sx={{
          display: { xs: "none", sm: "block" },
        }}
      >
        {drawer}
      </MiniDrawer>
      <MuiDrawer
        variant="temporary"
        open={navbarOpen}
        anchor="left"
        onClose={onNavbarClose}
        sx={{
          display: { xs: "block", sm: "none" },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </MuiDrawer>
    </>
  );
};

export default SideBar;
