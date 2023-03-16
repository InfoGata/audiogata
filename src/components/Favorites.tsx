import { Tab, Tabs } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router-dom";

const Favorites: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <>
      <Tabs value={pathname}>
        <Tab
          label={t("tracks")}
          value="/favorites/tracks"
          to="tracks"
          component={Link}
        />
        <Tab
          label={t("artists")}
          value="/favorites/artists"
          to="artists"
          component={Link}
        />
        <Tab
          label={t("albums")}
          value="/favorites/albums"
          to="albums"
          component={Link}
        />
        <Tab
          label={t("playlists")}
          value="/favorites/playlists"
          to="playlists"
          component={Link}
        />
      </Tabs>
      <Outlet />
    </>
  );
};

export default Favorites;
