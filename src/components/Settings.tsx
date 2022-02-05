import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { togglePlayOnStartup } from "../store/reducers/settingsReducer";

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const playOnStartup = useAppSelector((state) => state.settings.playOnStartup);
  const onChangePlayOnStartup = () => dispatch(togglePlayOnStartup());

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch checked={playOnStartup} onChange={onChangePlayOnStartup} />
        }
        label="Play current track on Startup"
      />
    </FormGroup>
  );
};

export default Settings;
