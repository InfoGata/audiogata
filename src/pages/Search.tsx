import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useLocation } from "react-router";
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

const Search: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const [tabValue, setTabValue] = React.useState<string>("tracks");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const onSearch = async () => {
    let searchAll: SearchAllResult | undefined;
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      searchAll = await plugin.remote.onSearchAll({ query: searchQuery });
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
      ["searchTracks", pluginId, searchQuery, undefined, undefined],
      searchAll?.tracks?.items
    );
    queryClient.setQueryData<Album[] | undefined>(
      ["searchAlbums", pluginId, searchQuery, undefined, undefined],
      searchAll?.albums?.items
    );
    queryClient.setQueryData<Artist[] | undefined>(
      ["searchArtists", pluginId, searchQuery, undefined, undefined],
      searchAll?.artists?.items
    );
    queryClient.setQueryData<PlaylistInfo[] | undefined>(
      ["searchPlaylists", pluginId, searchQuery, undefined, undefined],
      searchAll?.playlists?.items
    );

    return searchAll;
  };

  const query = useQuery(["search", pluginId, searchQuery], onSearch);
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
            searchQuery={searchQuery}
            initialPage={query.data?.tracks?.pageInfo}
          />
        ) : null}
      </TabsContent>
      <TabsContent value={tabValue}>
        {albumList.length > 0 ? (
          <AlbumSearchResults
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.albums?.pageInfo}
          />
        ) : null}
      </TabsContent>
      <TabsContent value={tabValue}>
        {artistList.length > 0 ? (
          <ArtistSearchResults
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.artists?.pageInfo}
          />
        ) : null}
      </TabsContent>
      <TabsContent value={tabValue}>
        {playlistList.length > 0 ? (
          <PlaylistSearchResults
            pluginId={pluginId}
            searchQuery={searchQuery}
            initialPage={query.data?.playlists?.pageInfo}
          />
        ) : null}
      </TabsContent>
    </>
  );
};

export default Search;
