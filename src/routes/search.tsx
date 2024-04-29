import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import usePlugins from "../hooks/usePlugins";
import {
  Album,
  Artist,
  PlaylistInfo,
  SearchAllResult,
  Track,
} from "../plugintypes";
import { SearchResultType } from "../types";
import AlbumSearchResults from "../components/AlbumSearchResults";
import ArtistSearchResults from "../components/ArtistSearchResults";
import PlaylistSearchResults from "../components/PlaylistSearchResults";
import SelectPlugin from "../components/SelectPlugin";
import Spinner from "../components/Spinner";
import TrackSearchResults from "../components/TrackSearchResults";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const Search: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const [tabValue, setTabValue] = React.useState<string>("tracks");
  const { q } = Route.useSearch();
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const onSearch = async () => {
    let searchAll: SearchAllResult | undefined;
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      searchAll = await plugin.remote.onSearchAll({ query: q });
    }

    if (searchAll?.tracks) {
      setTabValue(SearchResultType.Tracks);
    } else if (searchAll?.albums) {
      setTabValue(SearchResultType.Albums);
    } else if (searchAll?.artists) {
      setTabValue(SearchResultType.Artists);
    } else if (searchAll?.playlists) {
      setTabValue(SearchResultType.Playlists);
    }

    queryClient.setQueryData<Track[] | undefined>(
      ["searchTracks", pluginId, q, undefined, undefined],
      searchAll?.tracks?.items
    );
    queryClient.setQueryData<Album[] | undefined>(
      ["searchAlbums", pluginId, q, undefined, undefined],
      searchAll?.albums?.items
    );
    queryClient.setQueryData<Artist[] | undefined>(
      ["searchArtists", pluginId, q, undefined, undefined],
      searchAll?.artists?.items
    );
    queryClient.setQueryData<PlaylistInfo[] | undefined>(
      ["searchPlaylists", pluginId, q, undefined, undefined],
      searchAll?.playlists?.items
    );

    return searchAll;
  };

  const query = useQuery(["search", pluginId, q], onSearch);
  const trackList = query?.data?.tracks?.items || [];
  const albumList = query?.data?.albums?.items || [];
  const artistList = query?.data?.artists?.items || [];
  const playlistList = query?.data?.playlists?.items || [];

  const handleChange = (newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Spinner open={query.isLoading} />
      <SelectPlugin
        pluginId={pluginId}
        setPluginId={setPluginId}
        methodName="onSearchAll"
        useCurrentPlugin={true}
      />
      <Tabs value={tabValue} onValueChange={handleChange}>
        {trackList.length > 0 ? (
          <TabsTrigger value={SearchResultType.Tracks} className="flex-1">
            {t("tracks")}
          </TabsTrigger>
        ) : null}
        {albumList.length > 0 ? (
          <TabsTrigger value={SearchResultType.Albums}>
            {t("albums")}
          </TabsTrigger>
        ) : null}
        {artistList && artistList.length > 0 ? (
          <TabsTrigger value={SearchResultType.Artists}>
            {t("artists")}
          </TabsTrigger>
        ) : null}
        {playlistList && playlistList.length > 0 ? (
          <TabsTrigger value={SearchResultType.Playlists}>
            {t("playlists")}
          </TabsTrigger>
        ) : null}
      </Tabs>
      <TabsContent value={tabValue}>
        {trackList.length > 0 ? (
          <TrackSearchResults
            pluginId={pluginId}
            searchQuery={q}
            initialPage={query.data?.tracks?.pageInfo}
          />
        ) : null}
      </TabsContent>
      <TabsContent value={tabValue}>
        {albumList.length > 0 ? (
          <AlbumSearchResults
            pluginId={pluginId}
            searchQuery={q}
            initialPage={query.data?.albums?.pageInfo}
          />
        ) : null}
      </TabsContent>
      <TabsContent value={tabValue}>
        {artistList.length > 0 ? (
          <ArtistSearchResults
            pluginId={pluginId}
            searchQuery={q}
            initialPage={query.data?.artists?.pageInfo}
          />
        ) : null}
      </TabsContent>
      <TabsContent value={tabValue}>
        {playlistList.length > 0 ? (
          <PlaylistSearchResults
            pluginId={pluginId}
            searchQuery={q}
            initialPage={query.data?.playlists?.pageInfo}
          />
        ) : null}
      </TabsContent>
    </>
  );
};

const searchSchema = z.object({
  q: z.string().catch(""),
});

export const Route = createFileRoute("/search")({
  component: Search,
  validateSearch: searchSchema,
});
