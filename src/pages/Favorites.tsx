import FavoriteLink from "@/components/Favorites/FavoriteLink";
import React from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

const Favorites: React.FC = () => {
  const { t } = useTranslation();

  const favoriteLinks: { title: string; url: string }[] = [
    {
      title: t("tracks"),
      url: "/favorites/tracks",
    },
    {
      title: t("artists"),
      url: "/favorites/artists",
    },
    {
      title: t("albums"),
      url: "/favorites/albums",
    },
    {
      title: t("playlists"),
      url: "/favorites/playlists",
    },
  ];

  return (
    <div>
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 mb-2 text-muted-foreground">
        {favoriteLinks.map((fl) => (
          <FavoriteLink key={fl.title} {...fl} />
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default Favorites;
