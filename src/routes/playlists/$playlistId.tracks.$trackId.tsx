import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "@/hooks/usePlugins";
import { Track } from "@/plugintypes";
import { setPlaylistTracks } from "@/sync/library";
import { usePlaylist } from "@/sync/useLibrary";
import Spinner from "@/components/Spinner";
import TrackInfo from "@/components/TrackInfo";
import { Button } from "@/components/ui/button";

const PlaylistTrackInfo: React.FC = () => {
  const [showUpdateButton, setShowUpdateButton] = React.useState(false);
  const { trackId, playlistId } = Route.useParams();
  const playlist = usePlaylist(playlistId);
  const track = playlist?.tracks.find((t) => t.id === trackId);
  const { plugins } = usePlugins();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    const checkCanUpdate = async () => {
      if (track) {
        const plugin = plugins.find((p) => p.id === track.pluginId);
        if (plugin && (await plugin.hasDefined.onGetTrack())) {
          setShowUpdateButton(true);
        } else {
          setShowUpdateButton(false);
        }
      }
    };

    checkCanUpdate();
  }, [track, plugins]);

  const onUpdateTrack = async () => {
    if (track && track.apiId) {
      setIsUpdating(true);
      const plugin = plugins.find((p) => p.id === track.pluginId);
      try {
        if (playlist && plugin && (await plugin.hasDefined.onGetTrack())) {
          const newTrack: Track = await plugin.remote.onGetTrack({
            apiId: track.apiId,
          });
          newTrack.id = track.id;
          const newTracks = playlist.tracks.map((t) =>
            t.id === newTrack.id ? newTrack : t
          );
          await setPlaylistTracks(playlist, newTracks);
        }
      } catch {
        /* empty */
      }
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Spinner open={isUpdating} />
      {track ? (
        <div>
          <TrackInfo track={track} />
          {showUpdateButton && (
            <Button onClick={onUpdateTrack}>{t("updateTrackInfo")}</Button>
          )}
        </div>
      ) : (
        <>{t("notFound")}</>
      )}
    </>
  );
};

export const Route = createFileRoute("/playlists/$playlistId/tracks/$trackId")({
  component: PlaylistTrackInfo,
});
