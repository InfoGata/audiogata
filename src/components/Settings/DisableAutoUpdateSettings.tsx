import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppSelector } from "@/store/hooks";
import { toggleDisableAutoUpdatePlugins } from "@/store/reducers/settingsReducer";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

const DisableAutoUpdateSetting: React.FC = () => {
  const { t } = useTranslation("settings");
  const dispatch = useDispatch();
  const disableAutoUpdatePlugins = useAppSelector(
    (state) => state.settings.disableAutoUpdatePlugins
  );
  const onChangeDisableAutoUpdatePlugins = () =>
    dispatch(toggleDisableAutoUpdatePlugins());
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="auto-update"
        checked={disableAutoUpdatePlugins}
        onChange={onChangeDisableAutoUpdatePlugins}
      />
      <Label htmlFor="auto-update">{t("disableAutoUpdatePlugins")}</Label>
    </div>
  );
};

export default DisableAutoUpdateSetting;
