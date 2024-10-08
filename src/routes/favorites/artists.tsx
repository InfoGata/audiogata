import { createFileRoute } from "@tanstack/react-router";
import ArtistCard from "@/components/ArtistCard";
import CardContainer from "@/components/CardContainer";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import Spinner from "@/components/Spinner";
import { db } from "@/database";

const FavoriteArtists: React.FC = () => {
  const artists = useLiveQuery(() => db.favoriteArtists.toArray());

  if (!artists) {
    return <Spinner />;
  }

  return (
    <CardContainer>
      {artists?.map((a) => <ArtistCard key={a.id} artist={a} />)}
    </CardContainer>
  );
};

export const Route = createFileRoute("/favorites/artists")({
  component: FavoriteArtists,
});
