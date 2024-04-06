import ArtistCard from "@/components/ArtistCard";
import CardContainer from "@/components/CardContainer";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import Spinner from "../components/Spinner";
import { db } from "../database";

const FavoriteArtists: React.FC = () => {
  const artists = useLiveQuery(() => db.favoriteArtists.toArray());

  if (!artists) {
    return <Spinner />;
  }

  return (
    <CardContainer>
      {artists?.map((a) => (
        <ArtistCard artist={a} />
      ))}
    </CardContainer>
  );
};

export default FavoriteArtists;
