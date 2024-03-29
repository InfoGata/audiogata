import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { togglePlayOnStartup } from "@/store/reducers/settingsReducer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const PlayCurrentTrackStartup: React.FC = () => {
  const dispatch = useAppDispatch();
  const playOnStartup = useAppSelector((state) => state.settings.playOnStartup);
  const onChangePlayOnStartup = () => dispatch(togglePlayOnStartup());
  const { t } = useTranslation(["common", "settings"]);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="play-current-track"
        checked={playOnStartup}
        onChange={onChangePlayOnStartup}
      />
      <Label htmlFor="play-current-track">
        {t("settings:playCurrentTrack")}
      </Label>
    </div>
  );
};

export default PlayCurrentTrackStartup;
