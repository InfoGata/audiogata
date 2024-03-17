import { defaultSkipTime } from "@/utils";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import {
  saveCustomFowardAndRewindTime,
  saveShowForwardAndRewind,
} from "../../store/reducers/settingsReducer";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

const ShowForwardAndRewind: React.FC = () => {
  const { t } = useTranslation(["common", "settings"]);
  const dispatch = useDispatch();
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const customFowardAndRewindTime = useAppSelector(
    (state) => state.settings.customFowardAndRewindTime
  );

  const onChangeShowForwardAndRewind = (
    _e: React.ChangeEvent,
    checked: boolean
  ) => {
    dispatch(saveShowForwardAndRewind(checked));
  };

  const onChangeCustomFowardAndRewindTime = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(event.target.value);
    dispatch(saveCustomFowardAndRewindTime(value));
  };

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={showForwardAndRewind}
            onChange={onChangeShowForwardAndRewind}
          />
        }
        label={t("settings:showFastForwardRewind")}
      />
      {showForwardAndRewind && (
        <FormControl>
          <FormLabel id="radio-buttons-skip-time-label">
            {t("settings:forwardRewindTime")}
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            value={customFowardAndRewindTime || defaultSkipTime}
            onChange={onChangeCustomFowardAndRewindTime}
            name="radio-buttons-group"
          >
            <FormControlLabel value={5} control={<Radio />} label="5" />
            <FormControlLabel value={10} control={<Radio />} label="10" />
            <FormControlLabel value={30} control={<Radio />} label="30" />
            <TextField
              type="number"
              sx={{ width: "10ch" }}
              value={customFowardAndRewindTime || defaultSkipTime}
              onChange={onChangeCustomFowardAndRewindTime}
              inputProps={{
                shrink: "true",
              }}
            />
          </RadioGroup>
        </FormControl>
      )}
    </>
  );
};

export default ShowForwardAndRewind;
