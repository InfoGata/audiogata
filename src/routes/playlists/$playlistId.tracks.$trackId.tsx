import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/database";
import usePlugins from "@/hooks/usePlugins";
import { Track } from "@/plugintypes";
import { useAppDispatch } from "@/store/hooks";
import { setPlaylistTracks } from "@/store/reducers/playlistReducer";
import Spinner from "@/components/Spinner";
import TrackInfo from "@/components/TrackInfo";
import { Button } from "@/components/ui/button";

const PlaylistTrackInfo: React.FC = () => {
  const [showUpdateButton, setShowUpdateButton] = React.useState(false);
  const { trackId, playlistId } = Route.useParams();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [track, setTrack] = React.useState<Track>();
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    const getTrack = async () => {
      setBackdropOpen(true);
      if (playlistId) {
        const playlist = await db.playlists.get(playlistId);
        const track = playlist?.tracks.find((t) => t.id === trackId);
        setTrack(track);
      }
      setBackdropOpen(false);
    };
    getTrack();
  }, [trackId, playlistId]);

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
        if (playlistId && plugin && (await plugin.hasDefined.onGetTrack())) {
          const newTrack = await plugin.remote.onGetTrack({
            apiId: track.apiId,
          });
          newTrack.id = track.id;
          const playlist = await db.playlists.get(playlistId);
          if (playlist) {
            const newTracks = playlist.tracks.map((t) =>
              t.id === newTrack.id ? newTrack : t
            );
            dispatch(setPlaylistTracks(playlist, newTracks));
            setTrack(newTrack);
          }
        }
      } catch {
        /* empty */
      }
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Spinner open={backdropOpen || isUpdating} />
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
