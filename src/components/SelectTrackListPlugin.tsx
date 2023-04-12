import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { Track } from "../plugintypes";

interface SelectTrackListPluginProps {
  trackList: Track[];
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const SelectTrackListPlugin: React.FC<SelectTrackListPluginProps> = (props) => {
  const { trackList, setSelected } = props;
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const pluginNameMap = new Map(plugins.map((p) => [p.id, p.name]));
  const pluginIds = Array.from(new Set(trackList.map((t) => t.pluginId)));
  const options = pluginIds.map((p) => [
    p,
    pluginNameMap.has(p) ? pluginNameMap.get(p) : p,
  ]);
  const optionsComponents = options.map((option) => (
    <MenuItem key={option[0]} value={option[0]}>
      {option[1]}
    </MenuItem>
  ));
  const [pluginId, setPluginId] = React.useState<string>("");
  const onSelectPluginChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setPluginId(value);
    if (value) {
      const filterdList = trackList
        .filter((t) => t.pluginId === value)
        .map((t) => t.id) as string[];
      setSelected(new Set(filterdList));
    } else {
      setSelected(new Set());
    }
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="select-plugin">{t("selectPlugin")}</InputLabel>
      <Select
        id="select-plugin"
        value={pluginId}
        label="Select Plugin"
        onChange={onSelectPluginChange}
      >
        <MenuItem value={""}>{t("none")}</MenuItem>
        {optionsComponents}
      </Select>
    </FormControl>
  );
};

export default SelectTrackListPlugin;
