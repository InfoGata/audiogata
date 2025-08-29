import PlayButton from "@/components/PlayButton";
import PlaylistMenu from "@/components/PlaylistMenu";
import Spinner from "@/components/Spinner";
import TrackList from "@/components/TrackList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playQueue, setTrack, setTracks } from "@/store/reducers/trackReducer";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Track } from "@/plugintypes";
import usePlugins from "@/hooks/usePlugins";

const PluginLibraryTracks: React.FC = () => {
  const { pluginId } = Route.useParams();
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { plugins } = usePlugins();
  const { t } = useTranslation();

  const plugin = plugins.find((p: any) => p.id === pluginId);

  const getLibraryTracks = async () => {
    if (!plugin || !(await plugin.hasDefined.onGetLibraryTracks())) {
      return [];
    }
    const result = await plugin.remote.onGetLibraryTracks({ pageInfo: { offset: 0, resultsPerPage: 100 } });
    return result.items;
  };

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["libraryTracks", pluginId],
    queryFn: getLibraryTracks,
    enabled: !!plugin,
  });

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
    dispatch(setTracks(tracks || []));
  };

  const onPlay = () => {
    if (!tracks) return;
    dispatch(setTracks(tracks));
    dispatch(playQueue());
  };

  if (isLoading || !tracks) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("libraryTracks")}</h1>
      <PlayButton onClick={onPlay} />
      <PlaylistMenu
        playlists={playlists}
        tracklist={tracks ?? []}
        dropdownItems={[]}
      />
      <TrackList tracks={tracks || []} onTrackClick={onTrackClick} />
    </div>
  );
};

export const Route = createFileRoute("/plugins/$pluginId/library")({
  component: PluginLibraryTracks,
});