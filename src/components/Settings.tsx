import { Button, TextField } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import { useSnackbar } from "notistack";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  togglePlayOnStartup,
  saveCorsProxyUrl,
} from "../store/reducers/settingsReducer";

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const playOnStartup = useAppSelector((state) => state.settings.playOnStartup);
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const onChangePlayOnStartup = () => dispatch(togglePlayOnStartup());
  const [corsProxy, setCorsProxy] = React.useState(corsProxyUrl);

  const onCorsProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorsProxy(e.target.value);
  };

  const onCorsProxySave = () => {
    dispatch(saveCorsProxyUrl(corsProxy));
    enqueueSnackbar("Saved Cors Proxy Url", { variant: "success" });
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch checked={playOnStartup} onChange={onChangePlayOnStartup} />
        }
        label="Play current track on Startup"
      />
      <TextField
        label="Cors proxy Url"
        value={corsProxy || ""}
        onChange={onCorsProxyChange}
        InputProps={{
          endAdornment: <Button onClick={onCorsProxySave}>Save</Button>,
        }}
      />
    </FormGroup>
  );
};

export default Settings;
