import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  InputBase,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
import { Menu, Search, Clear, GitHub, Favorite } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router";
import { toggleNavbar } from "../store/reducers/uiReducer";
import { useAppDispatch } from "../store/hooks";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onToggleNavbar = () => dispatch(toggleNavbar());
  const [search, setSearch] = React.useState("");

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };
  const handleSubmit = (event: React.FormEvent<{}>) => {
    navigate(`/search?q=${search}`);
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
          AudioGata
        </Typography>
        <form onSubmit={handleSubmit}>
          <SearchBar>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={t("search")}
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
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: "none", sm: "flex" } }}>
          <IconButton component={Link} to="/donate">
            <Tooltip title={t("donate")} placement="bottom">
              <Favorite />
            </Tooltip>
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            href="https://github.com/InfoGata/audiogata"
            target="_blank"
          >
            <Tooltip title="Github" placement="bottom">
              <GitHub />
            </Tooltip>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
