import { Favorite, GitHub, Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  Link,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { toggleNavbar } from "../store/reducers/uiReducer";
import SearchBar from "./SearchBar";

const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const onToggleNavbar = () => dispatch(toggleNavbar());

  return (
    <AppBar
      position="fixed"
      color="default"
      sx={{ zIndex: theme.zIndex.drawer + 1 }}
    >
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
          sx={{ display: { xs: "none", sm: "block" }, pr: 2 }}
        >
          <Link color="inherit" underline="none" component={RouterLink} to="/">
            AudioGata
          </Link>
        </Typography>
        <SearchBar />
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: "none", sm: "flex" } }}>
          <IconButton component={RouterLink} to="/donate">
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
