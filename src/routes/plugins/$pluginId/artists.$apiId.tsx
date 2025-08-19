import { createFileRoute, useRouterState } from "@tanstack/react-router";
import AlbumCard from "@/components/AlbumCard";
import ItemMenu from "@/components/ItemMenu";
import React from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import Pager from "@/components/Pager";
import PlaylistInfoCard from "@/components/PlaylistInfoCard";
import Spinner from "@/components/Spinner";
import ArtistTopTracks from "@/components/ArtistTopTracks";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import { Artist, PageInfo, SortOption } from "@/plugintypes";

const ArtistPage: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useRouterState({ select: (state) => state.location.state });
  const [artistInfo, setArtistInfo] = React.useState<Artist | undefined>(
    state.artist
  );
  const { t } = useTranslation();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const [sortOptions, setSortOptions] = React.useState<SortOption[]>([]);
  const [currentSort, setCurrentSort] = React.useState<string>("");
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const onGetArtist = async () => {
    if (plugin && (await plugin.hasDefined.onGetArtistAlbums())) {
      const artistData = await plugin.remote.onGetArtistAlbums({
        apiId: apiId,
        pageInfo: page,
        sortBy: currentSort || undefined,
      });
      if (artistData.artist) {
        setArtistInfo(artistData.artist);
      }
      if (artistData.sortOptions) {
        setSortOptions(artistData.sortOptions);
      }
      if (artistData.sortBy !== undefined) {
        setCurrentSort(artistData.sortBy);
      }
      setCurrentPage(artistData.pageInfo);
      return artistData.items;
    }
    return [];
  };

  const query = useQuery(["artistpage", pluginId, apiId, page, currentSort], onGetArtist, {
    enabled: pluginsLoaded && !!plugin,
  });

  const handleArtistInfoUpdate = (artist: Artist) => {
    if (!artistInfo) {
      setArtistInfo(artist);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Spinner open={query.isLoading || isLoading} />
      
      {/* Artist Header Section */}
      <div className="relative">
        {artistInfo && (
          <div className="pb-8">
            <PlaylistInfoCard
              name={artistInfo.name || ""}
              images={artistInfo.images}
            />
            <div className="mt-6">
              <ItemMenu itemType={{ type: "artist", item: artistInfo }} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="top-tracks" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="top-tracks" className="text-sm font-medium">
              {t("topTracks")}
            </TabsTrigger>
            <TabsTrigger value="albums" className="text-sm font-medium">
              {t("albums")}
            </TabsTrigger>
          </TabsList>

          {/* Top Tracks Tab */}
          <TabsContent value="top-tracks" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <ArtistTopTracks
                  pluginId={pluginId}
                  apiId={apiId}
                  plugin={plugin}
                  pluginsLoaded={pluginsLoaded}
                  onArtistInfoUpdate={handleArtistInfoUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Albums Tab */}
          <TabsContent value="albums" className="space-y-6">
            {/* Sort Options */}
            {sortOptions.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("sortBy")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <Button
                          key={option.value}
                          size="sm"
                          variant={currentSort === option.value ? "default" : "outline"}
                          onClick={() => setCurrentSort(option.value)}
                          className="h-8 text-xs"
                        >
                          {option.displayName}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Albums Grid */}
            {query.data && query.data.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {query.data.map((album) => (
                  <AlbumCard 
                    key={album.id} 
                    album={album} 
                    noArtist={true} 
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground py-12">
                    <p>{t("noAlbumsFound")}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {(hasNextPage || hasPreviousPage) && (
              <div className="flex justify-center">
                <Pager
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onPreviousPage={onPreviousPage}
                  onNextPage={onNextPage}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </div>
  );
};

export const Route = createFileRoute("/plugins/$pluginId/artists/$apiId")({
  component: ArtistPage,
});
