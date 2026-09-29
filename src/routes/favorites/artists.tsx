import { createFileRoute } from "@tanstack/react-router";
import ArtistCard from "@/components/ArtistCard";
import CardContainer from "@/components/CardContainer";
import React from "react";
import { useFavorites } from "@/sync/useLibrary";

const FavoriteArtists: React.FC = () => {
  const artists = useFavorites("artists");

  return (
    <CardContainer>
      {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
    </CardContainer>
  );
};

export const Route = createFileRoute("/favorites/artists")({
  component: FavoriteArtists,
});
