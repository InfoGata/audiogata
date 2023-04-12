import { Backdrop, Button, CircularProgress, Grid } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import usePlugins from "../hooks/usePlugins";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateTrack } from "../store/reducers/trackReducer";
import TrackInfo from "./TrackInfo";

const QueueTrackInfo: React.FC = () => {
  const [showUpdateButton, setShowUpdateButton] = React.useState(false);
  const { trackId } = useParams<"trackId">();
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
          let newTrack = await plugin.remote.onGetTrack({ apiId: track.apiId });
          newTrack.id = track.id;
          dispatch(updateTrack(newTrack));
        }
      } catch {}
      setIsUpdating(false);
    }
  };

  return track ? (
    <Grid>
      <Backdrop open={isUpdating}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <TrackInfo track={track} />
      {showUpdateButton && (
        <Button variant="contained" onClick={onUpdateTrack}>
          {t("updateTrackInfo")}
        </Button>
      )}
    </Grid>
  ) : (
    <>{t("notFound")}</>
  );
};

export default QueueTrackInfo;
