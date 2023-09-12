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
  saveCorsProxyUrl,
  saveCustomFowardAndRewindTime,
  saveShowForwardAndRewind,
  toggleDisableAutoUpdatePlugins,
  togglePlayOnStartup,
  setLyricsPluginId,
} from "../store/reducers/settingsReducer";
import { defaultSkipTime } from "../utils";
import SelectPlugin from "./SelectPlugin";

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const playOnStartup = useAppSelector((state) => state.settings.playOnStartup);
  const onChangePlayOnStartup = () => dispatch(togglePlayOnStartup());
  const disableAutoUpdatePlugins = useAppSelector(
    (state) => state.settings.disableAutoUpdatePlugins
  );
  const onChangeDisableAutoUpdatePlugins = () =>
    dispatch(toggleDisableAutoUpdatePlugins());
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const customFowardAndRewindTime = useAppSelector(
    (state) => state.settings.customFowardAndRewindTime
  );
  const lyricsPluginId = useAppSelector(
    (state) => state.settings.lyricsPluginId
  );
  const [corsProxy, setCorsProxy] = React.useState(corsProxyUrl);
  const { t } = useTranslation(["common", "settings"]);

  const setLyricsPlugin = (pluginId: string) => {
    if (pluginId) {
      dispatch(setLyricsPluginId(pluginId));
    } else {
      dispatch(setLyricsPluginId(undefined));
    }
  };

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
          <Switch
            checked={disableAutoUpdatePlugins}
            onChange={onChangeDisableAutoUpdatePlugins}
          />
        }
        label={t("settings:disableAutoUpdatePlugins")}
      />
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
      <SelectPlugin
        pluginId={lyricsPluginId ?? ""}
        methodName="onGetLyrics"
        setPluginId={setLyricsPlugin}
        noneOption={true}
        labelText={t("settings:lyricsPlugin")}
      />
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
