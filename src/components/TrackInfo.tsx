import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { Track } from "../plugintypes";
import { formatSeconds } from "../utils";
import AboutLink, { AboutLinkProps } from "./AboutLink";

interface TrackInfoProps {
  track: Track;
}

const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  const { track } = props;
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const plugin = plugins.find((p) => p.id === track.pluginId);

  const aboutLinks: (AboutLinkProps | null)[] = [
    {
      title: t("trackName"),
      description: track.name,
    },
    {
      title: "Id",
      description: track.id,
    },
    {
      title: t("pluginId"),
      description: track.pluginId,
    },
    {
      title: t("plugin"),
      description: plugin?.name,
    },
    {
      title: "API Id",
      description: track.apiId,
    },
    {
      title: t("trackDuration"),
      description: formatSeconds(track.duration),
    },
  ];

  return <>{aboutLinks.map((a) => a && <AboutLink {...a} key={a.title} />)}</>;
};

export default TrackInfo;
