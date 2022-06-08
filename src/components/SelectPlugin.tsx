import { FormControl, InputLabel, NativeSelect } from "@mui/material";
import React from "react";
import { PluginInterface, usePlugins } from "../PluginsContext";
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
  React.useEffect(() => {
    const getOptions = async () => {
      const validPlugins = await filterAsync(plugins, (p) =>
        p.methodDefined(methodName)
      );
      setPluginId(validPlugins[0]?.id || "");
      const options: [string, string][] = validPlugins.map((p) => [
        p.id || "",
        p.name || "",
      ]);
      setOptions(options);
    };
    getOptions();
  }, [plugins, methodName, setPluginId]);

  const optionsComponents = options?.map((option) => (
    <option key={option[0]} value={option[0]}>
      {option[1]}
    </option>
  ));

  const onSelectPluginChange = (e: React.FormEvent<HTMLSelectElement>) => {
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
