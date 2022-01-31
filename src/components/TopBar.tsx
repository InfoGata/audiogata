import {
  AppBar,
  IconButton,
  InputAdornment,
  InputBase,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
import { Menu, Search } from "@mui/icons-material";
import { Clear } from "@mui/icons-material";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toggleNavbar } from "../store/reducers/uiReducer";
import { AppDispatch } from "../store/store";

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const TopBar: React.FC = () => {
  const theme = useTheme();
  const history = useHistory();
  const dispatch = useDispatch<AppDispatch>();
  const onToggleNavbar = () => dispatch(toggleNavbar());
  const [search, setSearch] = React.useState("");

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };
  const handleSubmit = (event: React.FormEvent<{}>) => {
    history.push(`/search?q=${search}`);
    event.preventDefault();
  };
  const onClearSearch = (_: React.ChangeEvent<{}>) => {
    setSearch("");
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          aria-label="open drawer"
          onClick={onToggleNavbar}
          size="large"
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Typography
          variant="h6"
          noWrap={true}
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          Audio PWA
        </Typography>
        <form onSubmit={handleSubmit}>
          <SearchBar>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              onChange={onSearchChange}
              value={search}
              name="query"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={onClearSearch} size="small">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              }
            />
          </SearchBar>
        </form>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
