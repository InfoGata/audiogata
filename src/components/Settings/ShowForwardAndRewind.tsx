import { defaultSkipTime } from "@/utils";
import {
  RadioGroupItem,
  RadioGroup as ShadRadioGroup,
} from "@/components/ui/radio-group";
import React from "react";
import { useDispatch } from "react-redux";
import {
  saveCustomFowardAndRewindTime,
  saveShowForwardAndRewind,
} from "../../store/reducers/settingsReducer";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";

const ShowForwardAndRewind: React.FC = () => {
  const { t } = useTranslation(["common", "settings"]);
  const dispatch = useDispatch();
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const customFowardAndRewindTime = useAppSelector(
    (state) => state.settings.customFowardAndRewindTime
  );

  const onChangeShowForwardAndRewind = (checked: boolean) => {
    dispatch(saveShowForwardAndRewind(checked));
  };

  const onChangeCustomFowardAndRewindTimeInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChangeCustomFowardAndRewindTime(event.target.value);
  };

  const onChangeCustomFowardAndRewindTime = (strValue: string) => {
    const value = Number(strValue);
    dispatch(saveCustomFowardAndRewindTime(value));
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-forward-rewind"
          checked={showForwardAndRewind}
          onCheckedChange={onChangeShowForwardAndRewind}
        />
        <Label htmlFor="show-forward-rewind">
          {t("settings:showFastForwardRewind")}
        </Label>
      </div>
      {showForwardAndRewind && (
        <div>
          <Label>{t("settings:forwardRewindTime")}</Label>
          <ShadRadioGroup
            value={
              customFowardAndRewindTime?.toString() ||
              defaultSkipTime.toString()
            }
            onValueChange={onChangeCustomFowardAndRewindTime}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="option-5" />
              <Label htmlFor="option-5">5</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="option-10" />
              <Label htmlFor="option-10">10</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="option-30" />
              <Label htmlFor="option-30">30</Label>
            </div>

            <Input
              type="number"
              className="w-24"
              value={customFowardAndRewindTime || defaultSkipTime}
              onChange={onChangeCustomFowardAndRewindTimeInput}
            />
          </ShadRadioGroup>
        </div>
      )}
    </>
  );
};

export default ShowForwardAndRewind;
