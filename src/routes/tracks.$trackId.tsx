import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import React from "react";
import { useTranslation } from "react-i18next";
import Spinner from "../components/Spinner";
import TrackInfo from "../components/TrackInfo";
import Waveform from "../components/Waveform";
import usePlugins from "../hooks/usePlugins";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateTrack } from "../store/reducers/trackReducer";

const QueueTrackInfo: React.FC = () => {
  const [showUpdateButton, setShowUpdateButton] = React.useState(false);
  const { trackId } = Route.useParams();
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | undefined>();

  const track = useAppSelector((state) =>
    state.track.tracks.find((p) => p.id === trackId)
  );

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

  React.useEffect(() => {
    const getAudioUrl = async () => {
      if (track && track.source) {
        setAudioUrl(track.source);
      } else if (track && track.apiId) {
        const plugin = plugins.find((p) => p.id === track.pluginId);
        if (plugin && (await plugin.hasDefined.onGetTrackUrl())) {
          try {
            const url = await plugin.remote.onGetTrackUrl({
              apiId: track.apiId,
            });
            setAudioUrl(url);
          } catch (error) {
            console.error("Failed to get track URL:", error);
          }
        }
      }
    };

    getAudioUrl();
  }, [track, plugins]);

  const onUpdateTrack = async () => {
    if (track && track.apiId) {
      setIsUpdating(true);
      const plugin = plugins.find((p) => p.id === track.pluginId);
      try {
        if (plugin && (await plugin.hasDefined.onGetTrack())) {
          const newTrack = await plugin.remote.onGetTrack({
            apiId: track.apiId,
          });
          newTrack.id = track.id;
          dispatch(updateTrack(newTrack));
        }
      } catch {
        /* empty */
      }
      setIsUpdating(false);
    }
  };

  return track ? (
    <div>
      <Spinner open={isUpdating} />
      <TrackInfo track={track} />
      <Waveform audioUrl={audioUrl} />
      {showUpdateButton && (
        <Button onClick={onUpdateTrack}>{t("updateTrackInfo")}</Button>
      )}
    </div>
  ) : (
    <>{t("notFound")}</>
  );
};

export const Route = createFileRoute("/tracks/$trackId")({
  component: QueueTrackInfo,
});
