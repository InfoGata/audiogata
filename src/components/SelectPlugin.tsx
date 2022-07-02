import { FormControl, InputLabel, NativeSelect } from "@mui/material";
import React from "react";
import { PluginInterface, usePlugins } from "../PluginsContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCurrentPluginId } from "../store/reducers/settingsReducer";
import { filterAsync } from "../utils";

interface SelectPluginProps {
  methodName: keyof PluginInterface;
  pluginId: string;
  setPluginId: (value: React.SetStateAction<string>) => void;
}

const SelectPlugin: React.FC<SelectPluginProps> = (props) => {
  const { methodName, setPluginId, pluginId } = props;
  const { plugins } = usePlugins();
  const [options, setOptions] = React.useState<[string, string][]>();
  const dispatch = useAppDispatch();
  const currentPluginId = useAppSelector(
    (state) => state.settings.currentPluginId
  );
  const setOptionLoaded = React.useRef(false);

  React.useEffect(() => {
    const getOptions = async () => {
      const validPlugins = await filterAsync(plugins, (p) =>
        p.methodDefined(methodName)
      );
      if (
        !currentPluginId ||
        !validPlugins.some((p) => p.id === currentPluginId)
      ) {
        setPluginId(validPlugins[0]?.id || "");
      } else {
        setPluginId(currentPluginId);
      }

      const options: [string, string][] = validPlugins.map((p) => [
        p.id || "",
        p.name || "",
      ]);
      setOptions(options);
    };
    if (!setOptionLoaded.current) {
      setOptionLoaded.current = true;
      getOptions();
    }
  }, [plugins, methodName, setPluginId, currentPluginId]);

  const optionsComponents = options?.map((option) => (
    <option key={option[0]} value={option[0]}>
      {option[1]}
    </option>
  ));

  const onSelectPluginChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const pluginId = e.currentTarget.value;
    dispatch(setCurrentPluginId(pluginId));
    setPluginId(e.currentTarget.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel variant="standard" htmlFor="uncontrolled-native">
        Plugin
      </InputLabel>
      <NativeSelect
        value={pluginId}
        onChange={onSelectPluginChange}
        inputProps={{
          name: "plugin",
          id: "uncontrolled-native",
        }}
      >
        {optionsComponents}
      </NativeSelect>
    </FormControl>
  );
};

export default SelectPlugin;
