import { createFileRoute } from "@tanstack/react-router";
import PlaylistListItem from "@/components/PlaylistListItem";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/database";

const FavoriteChannels: React.FC = () => {
  const playlists = useLiveQuery(() => db.favoritePlaylists.toArray());
  const { t } = useTranslation();

  if (!playlists) {
    return null;
  }

  if (playlists.length === 0) {
    return <h3>{t("noFavoritePlaylists")}</h3>;
  }

  const playlistList = playlists.map((p) => (
    <PlaylistListItem key={p.id} playlist={p} />
  ));

  return <div>{playlistList}</div>;
};

export const Route = createFileRoute("/favorites/playlists")({
  component: FavoriteChannels,
});
