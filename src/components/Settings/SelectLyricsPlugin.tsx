import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import SelectPlugin from "../SelectPlugin";
import { setLyricsPluginId } from "../../store/reducers/settingsReducer";

const SelectLyricsPlugin: React.FC = () => {
  const { t } = useTranslation(["common", "settings"]);
  const lyricsPluginId = useAppSelector(
    (state) => state.settings.lyricsPluginId
  );
  const dispatch = useAppDispatch();

  const setLyricsPlugin = (pluginId: string) => {
    if (pluginId) {
      dispatch(setLyricsPluginId(pluginId));
    } else {
      dispatch(setLyricsPluginId(undefined));
    }
  };

  return (
    <SelectPlugin
      pluginId={lyricsPluginId ?? ""}
      methodName="onGetLyrics"
      setPluginId={setLyricsPlugin}
      noneOption={true}
      labelText={t("settings:lyricsPlugin")}
    />
  );
};

export default SelectLyricsPlugin;
