import {
  AppBar,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  createStyles,
  fade,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";
import { Menu, Search } from "@material-ui/icons";
import React from "react";
import { useDispatch } from "react-redux";
import { toggleNavbar } from "../store/reducers/uiReducer";
import { AppDispatch } from "../store/store";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: 200,
      },
    },
    inputRoot: {
      color: "inherit",
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    search: {
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      backgroundColor: fade(theme.palette.common.white, 0.15),
      borderRadius: theme.shape.borderRadius,
      marginLeft: 0,
      marginRight: theme.spacing(2),
      position: "relative",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
      },
    },
    searchIcon: {
      alignItems: "center",
      display: "flex",
      height: "100%",
      justifyContent: "center",
      pointerEvents: "none",
      position: "absolute",
      width: theme.spacing(7),
    },
    title: {
      display: "none",
      [theme.breakpoints.up("sm")]: {
        display: "block",
      },
    },
  }),
);

const TopBar: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const onToggleNavbar = () => dispatch(toggleNavbar());

  return (
    <AppBar position="fixed" color="default" className={classes.appBar}>
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="open drawer"
          onClick={onToggleNavbar}
        >
          <Menu />
        </IconButton>
        <Typography className={classes.title} variant="h6" noWrap={true}>
          Audio PWA
        </Typography>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <Search />
          </div>
          <InputBase
            placeholder="Search…"
            classes={{
              input: classes.inputInput,
              root: classes.inputRoot,
            }}
            inputProps={{ "aria-label": "search" }}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
