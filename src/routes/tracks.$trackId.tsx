import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import React from "react";
import { useTranslation } from "react-i18next";
import Spinner from "../components/Spinner";
import TrackInfo from "../components/TrackInfo";
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
