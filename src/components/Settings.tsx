import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Switch from "@material-ui/core/Switch";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { togglePlayOnStartup } from "../store/reducers/settingsReducer";
import { AppDispatch, AppState } from "../store/store";

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const playOnStartup = useSelector(
    (state: AppState) => state.settings.playOnStartup,
  );
  const onChangePlayOnStartup = () => {
    dispatch(togglePlayOnStartup());
  };

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
