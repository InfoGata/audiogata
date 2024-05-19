import { createFileRoute } from "@tanstack/react-router";
import AlbumCard from "@/components/AlbumCard";
import CardContainer from "@/components/CardContainer";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import Spinner from "@/components/Spinner";
import { db } from "@/database";

const FavoriteAlbums: React.FC = () => {
  const albums = useLiveQuery(() => db.favoriteAlbums.toArray());

  if (!albums) {
    return <Spinner />;
  }

  return (
    <CardContainer>
      {albums.map((a) => (
        <AlbumCard key={a.id} album={a} />
      ))}
    </CardContainer>
  );
};

export const Route = createFileRoute("/favorites/albums")({
  component: FavoriteAlbums,
});
