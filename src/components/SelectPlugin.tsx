import { FormControl, InputLabel, NativeSelect } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginMethodInterface } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { useAppDispatch, useAppStore } from "../store/hooks";
import { setCurrentPluginId } from "../store/reducers/settingsReducer";
import { filterAsync } from "../utils";

interface SelectPluginProps {
  methodName: keyof PluginMethodInterface;
  pluginId: string;
  setPluginId: (value: string) => void;
  noneOption?: boolean;
  useCurrentPlugin?: boolean;
  labelText?: string;
}

const SelectPlugin: React.FC<SelectPluginProps> = (props) => {
  const {
    methodName,
    setPluginId,
    pluginId,
    noneOption,
    useCurrentPlugin,
    labelText,
  } = props;
  const { plugins } = usePlugins();
  const [options, setOptions] = React.useState<[string, string][]>();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { t } = useTranslation();

  React.useEffect(() => {
    const getOptions = async () => {
      const validPlugins = await filterAsync(plugins, (p) =>
        p.methodDefined(methodName)
      );
      if (useCurrentPlugin) {
        const currentPluginId = store.getState().settings.currentPluginId;
        if (
          !currentPluginId ||
          !validPlugins.some((p) => p.id === currentPluginId)
        ) {
          setPluginId(validPlugins[0]?.id || "");
        } else {
          setPluginId(currentPluginId);
        }
      }

      const options: [string, string][] = validPlugins.map((p) => [
        p.id || "",
        p.name || "",
      ]);
      setOptions(options);
    };
    getOptions();
  }, [plugins, methodName, setPluginId, store, useCurrentPlugin]);

  const optionsComponents = options?.map((option) => (
    <option key={option[0]} value={option[0]}>
      {option[1]}
    </option>
  ));

  const onSelectPluginChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const selectedPluginId = e.currentTarget.value;
    if (useCurrentPlugin) {
      dispatch(setCurrentPluginId(selectedPluginId));
    }
    setPluginId(e.currentTarget.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel
        variant="standard"
        htmlFor="uncontrolled-native"
        shrink={true}
      >
        {labelText ? labelText : t("plugin")}
      </InputLabel>
      <NativeSelect
        value={pluginId}
        onChange={onSelectPluginChange}
        inputProps={{
          name: "plugin",
          id: "uncontrolled-native",
        }}
      >
        {!!noneOption && <option value="">{t("none")}</option>}
        {optionsComponents}
      </NativeSelect>
    </FormControl>
  );
};

export default SelectPlugin;
