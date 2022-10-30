import { Button, FormControlLabel, Switch, TextField } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  saveCorsProxyUrl,
  saveShowForwardAndRewind,
} from "../store/reducers/settingsReducer";

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const [corsProxy, setCorsProxy] = React.useState(corsProxyUrl);
  const { t } = useTranslation();

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

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={showForwardAndRewind}
            onChange={onChangeShowForwardAndRewind}
          />
        }
        label="Show Fast Forward and Rewind Buttons"
      />
      <TextField
        label="Cors proxy Url"
        value={corsProxy || ""}
        onChange={onCorsProxyChange}
        InputProps={{
          endAdornment: <Button onClick={onCorsProxySave}>{t("save")}</Button>,
        }}
      />
    </FormGroup>
  );
};

export default Settings;
