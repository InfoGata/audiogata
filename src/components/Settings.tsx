import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  togglePlayOnStartup,
  saveCorsProxyUrl,
  saveShowForwardAndRewind,
  saveCustomFowardAndRewindTime,
} from "../store/reducers/settingsReducer";
import { defaultSkipTime } from "../utils";

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const playOnStartup = useAppSelector((state) => state.settings.playOnStartup);
  const onChangePlayOnStartup = () => dispatch(togglePlayOnStartup());
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const customFowardAndRewindTime = useAppSelector(
    (state) => state.settings.customFowardAndRewindTime
  );
  const [corsProxy, setCorsProxy] = React.useState(corsProxyUrl);
  const { t } = useTranslation(["common", "settings"]);

  const onCorsProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorsProxy(e.target.value);
  };

  const onCorsProxySave = () => {
    dispatch(saveCorsProxyUrl(corsProxy));
    enqueueSnackbar("Saved Cors Proxy Url", { variant: "success" });
  };

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
    <FormGroup>
      <FormControlLabel
        control={
          <Switch checked={playOnStartup} onChange={onChangePlayOnStartup} />
        }
        label={t("settings:playCurrentTrack")}
      />
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
              sx={{ width: "6ch" }}
              value={customFowardAndRewindTime || defaultSkipTime}
              onChange={onChangeCustomFowardAndRewindTime}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
          </RadioGroup>
        </FormControl>
      )}
      <TextField
        label="Cors proxy Url"
        value={corsProxy || ""}
        onChange={onCorsProxyChange}
        InputProps={{
          endAdornment: (
            <Button onClick={onCorsProxySave}>{t("common:save")}</Button>
          ),
        }}
      />
    </FormGroup>
  );
};

export default Settings;
