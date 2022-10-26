import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useAppSelector } from "../store/hooks";
import TrackInfo from "./TrackInfo";

const QueueTrackInfo: React.FC = () => {
  const { trackId } = useParams<"trackId">();
  const { t } = useTranslation();

  const track = useAppSelector((state) =>
    state.track.tracks.find((p) => p.id === trackId)
  );
  return track ? <TrackInfo track={track} /> : <>{t("notFound")}</>;
};

export default QueueTrackInfo;
