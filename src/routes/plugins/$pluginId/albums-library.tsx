import AlbumCard from "@/components/AlbumCard";
import CardContainer from "@/components/CardContainer";
import Spinner from "@/components/Spinner";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Album } from "@/plugintypes";
import usePlugins from "@/hooks/usePlugins";

const PluginLibraryAlbums: React.FC = () => {
  const { pluginId } = Route.useParams();
  const { plugins } = usePlugins();
  const { t } = useTranslation();

  const plugin = plugins.find((p: any) => p.id === pluginId);

  const getLibraryAlbums = async () => {
    if (!plugin || !(await plugin.hasDefined.onGetLibraryAlbums())) {
      return [];
    }
    const result = await plugin.remote.onGetLibraryAlbums({ pageInfo: { offset: 0, resultsPerPage: 100 } });
    return result.items;
  };

  const { data: albums, isLoading } = useQuery({
    queryKey: ["libraryAlbums", pluginId],
    queryFn: getLibraryAlbums,
    enabled: !!plugin,
  });

  if (isLoading || !albums) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("libraryAlbums")}</h1>
      <CardContainer>
        {albums.map((album: Album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </CardContainer>
    </div>
  );
};

export const Route = createFileRoute("/plugins/$pluginId/albums-library")({
  component: PluginLibraryAlbums,
});