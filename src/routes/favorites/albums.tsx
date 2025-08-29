import { createFileRoute, Link } from "@tanstack/react-router";
import AlbumCard from "@/components/AlbumCard";
import CardContainer from "@/components/CardContainer";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import Spinner from "@/components/Spinner";
import { db } from "@/database";
import usePlugins from "@/hooks/usePlugins";
import { Button } from "@/components/ui/button";
import { LibraryIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const FavoriteAlbums: React.FC = () => {
  const albums = useLiveQuery(() => db.favoriteAlbums.toArray());
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const [libraryPlugins, setLibraryPlugins] = React.useState<Array<{id: string, name: string}>>([]);

  React.useEffect(() => {
    const checkPlugins = async () => {
      const availablePlugins = [];
      for (const plugin of plugins) {
        if (plugin.id && plugin.name && await plugin.hasDefined.onGetLibraryAlbums()) {
          availablePlugins.push({ id: plugin.id, name: plugin.name });
        }
      }
      setLibraryPlugins(availablePlugins);
    };
    checkPlugins();
  }, [plugins]);

  if (!albums) {
    return <Spinner />;
  }

  return (
    <div>
      {libraryPlugins.length > 0 && (
        <div className="mb-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <LibraryIcon className="mr-2" size={20} />
            {t("pluginLibraries")}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {libraryPlugins.map((plugin) => (
              <Button key={plugin.id} variant="outline" asChild>
                <Link to="/plugins/$pluginId/albums-library" params={{ pluginId: plugin.id }}>
                  {plugin.name} {t("library")}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <CardContainer>
        {albums.map((a) => (
          <AlbumCard key={a.id} album={a} />
        ))}
      </CardContainer>
    </div>
  );
};

export const Route = createFileRoute("/favorites/albums")({
  component: FavoriteAlbums,
});
