import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { togglePlayOnStartup } from "@/store/reducers/settingsReducer";
import { FormControlLabel, Switch } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const PlayCurrentTrackStartup: React.FC = () => {
  const dispatch = useAppDispatch();
  const playOnStartup = useAppSelector((state) => state.settings.playOnStartup);
  const onChangePlayOnStartup = () => dispatch(togglePlayOnStartup());
  const { t } = useTranslation(["common", "settings"]);

  return (
    <FormControlLabel
      control={
        <Switch checked={playOnStartup} onChange={onChangePlayOnStartup} />
      }
      label={t("settings:playCurrentTrack")}
    />
  );
};

export default PlayCurrentTrackStartup;
